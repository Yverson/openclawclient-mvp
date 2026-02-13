import express from 'express';
import cors from 'cors';
import jwt from 'jsonwebtoken';
import bcryptjs from 'bcryptjs';
import http from 'http';
import { WebSocketServer, WebSocket as WsWebSocket } from 'ws';
import dotenv from 'dotenv';
import fs from 'fs';
import path from 'path';
import { randomUUID } from 'crypto';

dotenv.config();

const PORT = process.env.PORT || 18790;
const CORS_ORIGINS = (process.env.CORS_ORIGINS || 'http://localhost:3000,http://localhost:5173')
  .split(',')
  .map((origin) => origin.trim())
  .filter(Boolean);
const JWT_SECRET = process.env.JWT_SECRET || 'dev-secret-key-change-in-production';

// OpenClaw Gateway config
const GATEWAY_URL = process.env.OPENCLAW_GATEWAY_URL || 'ws://127.0.0.1:18789';
const GATEWAY_TOKEN = process.env.OPENCLAW_GATEWAY_TOKEN || 'ba1147337c2a645316fb88ef1d1b6342ea76e64ade028a1d';
const PROTOCOL_VERSION = 3;

// User → Agent bindings
const USER_AGENT_BINDINGS = {
  'mathieu@openclawclient.com': 'agent-mathieu',
  'tania@openclawclient.com': 'agent-tania',
  'ezekiel@openclawclient.com': 'agent-ezekiel',
};

const DEFAULT_AGENT = 'main';

function resolveAgentForUser(email) {
  return USER_AGENT_BINDINGS[email] || DEFAULT_AGENT;
}

function buildSessionKey(agentId, peerId) {
  return `agent:${agentId}:webchat:dm:${peerId}`;
}

// Data file paths
const DATA_DIR = path.join(process.cwd(), 'data');
const USERS_FILE = path.join(DATA_DIR, 'users.json');
const CONVERSATIONS_FILE = path.join(DATA_DIR, 'conversations.json');

if (!fs.existsSync(DATA_DIR)) {
  fs.mkdirSync(DATA_DIR, { recursive: true });
}

function loadUsers() {
  try {
    if (fs.existsSync(USERS_FILE)) {
      return JSON.parse(fs.readFileSync(USERS_FILE, 'utf8'));
    }
  } catch (error) {
    console.error(`Error loading users: ${error.message}`);
  }
  return [];
}

function saveUsers(users) {
  try {
    fs.writeFileSync(USERS_FILE, JSON.stringify(users, null, 2));
  } catch (error) {
    console.error(`Error saving users: ${error.message}`);
  }
}

function loadConversations() {
  try {
    if (fs.existsSync(CONVERSATIONS_FILE)) {
      return JSON.parse(fs.readFileSync(CONVERSATIONS_FILE, 'utf8'));
    }
  } catch (error) {
    console.error(`Error loading conversations: ${error.message}`);
  }
  return {};
}

function saveConversations(conversations) {
  try {
    fs.writeFileSync(CONVERSATIONS_FILE, JSON.stringify(conversations, null, 2));
  } catch (error) {
    console.error(`Error saving conversations: ${error.message}`);
  }
}

function addMessageToHistory(userId, role, content) {
  const conversations = loadConversations();
  if (!conversations[userId]) {
    conversations[userId] = [];
  }
  conversations[userId].push({
    id: `msg-${Date.now()}-${Math.random()}`,
    role,
    content,
    timestamp: new Date().toISOString()
  });
  saveConversations(conversations);
}

// ==================== GATEWAY CLIENT ====================

class GatewayClient {
  constructor() {
    this.ws = null;
    this.connected = false;
    this.pendingRequests = new Map();
    this.sessionListeners = new Map();
    this.runListeners = new Map();
    this.reconnectTimer = null;
  }

  async connect() {
    return new Promise((resolve, reject) => {
      console.log(`🔌 Connecting to OpenClaw Gateway at ${GATEWAY_URL}...`);
      this.ws = new WsWebSocket(GATEWAY_URL);

      this.ws.on('open', () => {
        console.log('🔌 WebSocket open, sending connect handshake...');
        this.sendConnect()
          .then(() => {
            this.connected = true;
            console.log('✅ Connected to OpenClaw Gateway');
            resolve();
          })
          .catch(reject);
      });

      this.ws.on('message', (data) => {
        try {
          const msg = JSON.parse(data.toString());
          this.handleMessage(msg);
        } catch (e) {
          console.error('Failed to parse gateway message:', e);
        }
      });

      this.ws.on('close', () => {
        console.log('🔌 Gateway connection closed');
        this.connected = false;
        this.scheduleReconnect();
      });

      this.ws.on('error', (err) => {
        console.error('Gateway WebSocket error:', err.message);
        if (!this.connected) reject(err);
      });
    });
  }

  async sendConnect() {
    const id = randomUUID().slice(0, 8);
    return new Promise((resolve, reject) => {
      const timeout = setTimeout(() => {
        this.pendingRequests.delete(id);
        reject(new Error('Connect handshake timeout'));
      }, 10000);

      this.pendingRequests.set(id, { resolve, reject, timeout });

      this.send({
        type: 'req',
        id,
        method: 'connect',
        params: {
          minProtocol: PROTOCOL_VERSION,
          maxProtocol: PROTOCOL_VERSION,
          role: 'operator',
          scopes: ['operator.admin'],
          auth: { token: GATEWAY_TOKEN },
          client: {
            id: 'gateway-client',
            displayName: 'OpenClaw Client Backend',
            mode: 'backend',
            version: '1.0.0',
            platform: 'linux',
          },
        },
      });
    });
  }

  handleMessage(msg) {
    // Response to a request
    if (msg.type === 'res' && msg.id) {
      const pending = this.pendingRequests.get(msg.id);
      if (pending) {
        clearTimeout(pending.timeout);
        this.pendingRequests.delete(msg.id);
        if (msg.ok) {
          pending.resolve(msg.data);
        } else {
          pending.reject(new Error(msg.error?.message || 'Request failed'));
        }
      }
      return;
    }

    // Broadcast events (gateway sends type='event' or type='evt')
    if (msg.type === 'evt' || msg.type === 'event') {
      const event = msg.event;
      const data = msg.data || msg.payload;

      // Ignore chat events - we use agent events instead to avoid duplicates

      // Agent events contain the streaming text
      if (event === 'agent' && data) {
        const sessionKey = data.sessionKey;
        const listener = this.sessionListeners.get(sessionKey);
        if (listener && data.stream === 'assistant' && data.data?.text) {
          // Streaming text from the agent
          listener({ state: 'delta', delta: data.data.text, sessionKey, runId: data.runId, seq: data.seq });
        }
        if (listener && data.stream === 'lifecycle') {
          if (data.data?.phase === 'end') {
            listener({ state: 'agent-done', sessionKey, runId: data.runId, seq: data.seq });
          }
        }
      }
    }
  }

  send(data) {
    if (this.ws && this.ws.readyState === WsWebSocket.OPEN) {
      this.ws.send(JSON.stringify(data));
    }
  }

  scheduleReconnect() {
    if (this.reconnectTimer) return;
    this.reconnectTimer = setTimeout(() => {
      this.reconnectTimer = null;
      this.connect().catch((err) => {
        console.error('Gateway reconnect failed:', err.message);
      });
    }, 5000);
  }

  async request(method, params, timeoutMs = 60000) {
    if (!this.connected || !this.ws) {
      throw new Error('Not connected to gateway');
    }
    const id = randomUUID().slice(0, 8);
    return new Promise((resolve, reject) => {
      const timeout = setTimeout(() => {
        this.pendingRequests.delete(id);
        reject(new Error(`Request ${method} timeout`));
      }, timeoutMs);
      this.pendingRequests.set(id, { resolve, reject, timeout });
      this.send({ type: 'req', id, method, params });
    });
  }

  async sendChat(sessionKey, message) {
    const idempotencyKey = randomUUID().slice(0, 8);
    const result = await this.request('chat.send', {
      sessionKey,
      message,
      idempotencyKey,
    });
    return result?.runId || idempotencyKey;
  }

  async getChatHistory(sessionKey, limit = 50) {
    const result = await this.request('chat.history', {
      sessionKey,
      limit,
    });
    return result?.messages || [];
  }

  onSession(sessionKey, listener) {
    this.sessionListeners.set(sessionKey, listener);
  }

  offSession(sessionKey) {
    this.sessionListeners.delete(sessionKey);
  }

  isConnected() {
    return this.connected;
  }
}

const gateway = new GatewayClient();

// ==================== EXPRESS APP ====================

const app = express();
const server = http.createServer(app);
const wss = new WebSocketServer({ server });

app.use(cors({
  origin: (origin, callback) => {
    if (!origin) return callback(null, true);
    if (CORS_ORIGINS.includes('*') || CORS_ORIGINS.includes(origin)) {
      return callback(null, true);
    }
    return callback(new Error(`CORS blocked for origin: ${origin}`));
  },
  credentials: true
}));
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Mock user store
const users = new Map();

// Pre-create bound users
async function initUsers() {
  const defaultUsers = [
    { email: 'mathieu@openclawclient.com', password: 'mathieu2024' },
    { email: 'tania@openclawclient.com', password: 'tania2024' },
    { email: 'ezekiel@openclawclient.com', password: 'ezekiel2024' },
  ];

  for (const u of defaultUsers) {
    if (!users.has(u.email)) {
      users.set(u.email, {
        id: `user-${u.email.split('@')[0]}`,
        email: u.email,
        password: await bcryptjs.hash(u.password, 10),
      });
    }
  }
  console.log(`👥 ${users.size} users initialized`);
}

// Auth middleware
function authMiddleware(req, res, next) {
  const authHeader = req.headers.authorization;
  if (!authHeader || !authHeader.startsWith('Bearer ')) {
    return res.status(401).json({ error: 'Missing or invalid authorization header' });
  }
  const token = authHeader.substring(7);
  try {
    req.user = jwt.verify(token, JWT_SECRET);
    next();
  } catch (error) {
    return res.status(401).json({ error: 'Invalid token' });
  }
}

function optionalAuth(req, res, next) {
  const authHeader = req.headers.authorization;
  if (authHeader && authHeader.startsWith('Bearer ')) {
    try {
      req.user = jwt.verify(authHeader.substring(7), JWT_SECRET);
    } catch (error) { /* ignore */ }
  }
  next();
}

app.use((req, res, next) => {
  console.log(`${new Date().toISOString()} ${req.method} ${req.path}`);
  next();
});

// ==================== ROUTES ====================

app.get('/health', (req, res) => {
  res.json({
    status: 'ok',
    gateway: gateway.isConnected() ? 'connected' : 'disconnected',
    timestamp: new Date().toISOString()
  });
});

app.get('/', (req, res) => {
  res.json({
    name: 'OpenClaw Client Backend',
    version: '2.0.0',
    status: 'running',
    gateway: gateway.isConnected() ? 'connected' : 'disconnected',
    bindings: Object.keys(USER_AGENT_BINDINGS),
  });
});

// ==================== AUTH ====================

app.post('/auth/login', async (req, res) => {
  try {
    const { email, password } = req.body;
    if (!email || !password) {
      return res.status(400).json({ error: 'Email and password required' });
    }
    const user = users.get(email);
    if (!user) {
      return res.status(401).json({ error: 'Invalid credentials' });
    }
    const isValid = await bcryptjs.compare(password, user.password);
    if (!isValid) {
      return res.status(401).json({ error: 'Invalid credentials' });
    }
    const agentId = resolveAgentForUser(email);
    const token = jwt.sign(
      { userId: user.id, email: user.email, agentId },
      JWT_SECRET,
      { expiresIn: '7d' }
    );
    res.json({
      token,
      user: { id: user.id, email: user.email, agentId }
    });
  } catch (error) {
    res.status(500).json({ error: error.message || 'Login failed' });
  }
});

app.post('/auth/register', async (req, res) => {
  try {
    const { email, password } = req.body;
    if (!email || !password) {
      return res.status(400).json({ error: 'Email and password required' });
    }
    if (users.has(email)) {
      return res.status(400).json({ error: 'User already exists' });
    }
    const id = `user-${Date.now()}`;
    const hashedPassword = await bcryptjs.hash(password, 10);
    users.set(email, { id, email, password: hashedPassword });
    const agentId = resolveAgentForUser(email);
    res.status(201).json({ id, email, agentId });
  } catch (error) {
    res.status(500).json({ error: error.message || 'Registration failed' });
  }
});

app.get('/auth/me', authMiddleware, (req, res) => {
  const agentId = resolveAgentForUser(req.user.email);
  res.json({
    userId: req.user.userId,
    email: req.user.email,
    agentId,
  });
});

app.post('/auth/token', async (req, res) => {
  try {
    const { token } = req.body;
    if (!token) return res.status(400).json({ error: 'Token required' });
    const decoded = jwt.verify(token, JWT_SECRET);
    const user = Array.from(users.values()).find(u => u.id === decoded.userId);
    if (!user) return res.status(401).json({ error: 'User not found' });
    const agentId = resolveAgentForUser(user.email);
    res.json({ token, user: { id: user.id, email: user.email, agentId } });
  } catch (error) {
    res.status(401).json({ error: 'Invalid token' });
  }
});

// ==================== API ====================

app.get('/api/status', optionalAuth, (req, res) => {
  res.json({
    status: 'ok',
    version: '2.0.0',
    timestamp: new Date().toISOString(),
    authenticated: !!req.user,
    gateway: gateway.isConnected() ? 'connected' : 'disconnected',
  });
});

app.get('/api/emails', authMiddleware, (req, res) => {
  res.json([
    { id: '1', from: 'contact@example.com', to: req.user.email, subject: 'Welcome to OpenClaw Client', body: 'Welcome!', date: new Date(Date.now() - 86400000).toISOString() },
  ]);
});

app.get('/api/files', authMiddleware, (req, res) => {
  res.json([
    { id: '1', name: 'openclaw-architecture.pdf', size: 2048576, type: 'application/pdf', uploadedAt: new Date().toISOString() },
  ]);
});

app.get('/api/dashboard', authMiddleware, (req, res) => {
  const agentId = resolveAgentForUser(req.user.email);
  res.json({
    user: { ...req.user, agentId },
    stats: { totalEmails: 24, totalFiles: 13, activeChats: 2, lastSync: new Date().toISOString() },
    recentActivity: [],
  });
});

app.get('/api/chat/history', authMiddleware, async (req, res) => {
  const agentId = resolveAgentForUser(req.user.email);
  const sessionKey = buildSessionKey(agentId, req.user.email);

  try {
    if (gateway.isConnected()) {
      const history = await gateway.getChatHistory(sessionKey, 50);
      const messages = history.map((m, i) => ({
        id: `hist-${i}`,
        content: typeof m.content === 'string' ? m.content
          : m.content?.[0]?.text || JSON.stringify(m.content),
        sender: m.role === 'user' ? 'user' : 'assistant',
        timestamp: m.timestamp ? new Date(m.timestamp).toISOString() : new Date().toISOString(),
        read: true,
      }));
      return res.json({ messages });
    }
  } catch (err) {
    console.log('Gateway history failed, falling back to local:', err.message);
  }

  // Fallback to local history
  const conversations = loadConversations();
  const userHistory = conversations[req.user.userId] || [];
  const messages = userHistory.map(msg => ({
    id: msg.id,
    content: msg.content,
    sender: msg.role === 'user' ? 'user' : 'assistant',
    timestamp: msg.timestamp,
    read: true,
  }));
  res.json({ messages });
});

// Legacy Matrix API endpoints (kept for backward compatibility)
app.get('/api/matrix/messages', (req, res) => {
  res.json({ messages: [] });
});

app.post('/api/matrix/respond', express.json(), (req, res) => {
  res.json({ success: true, message: 'Legacy endpoint - use gateway bindings' });
});

// ==================== WEBSOCKET CHAT (GATEWAY PROXY) ====================

const clientConnections = new Map();

wss.on('connection', (ws, req) => {
  const url = new URL(req.url, `http://${req.headers.host}`);
  const token = url.searchParams.get('token');

  if (!token) {
    ws.close(4001, 'Missing token');
    return;
  }

  let decoded;
  try {
    decoded = jwt.verify(token, JWT_SECRET);
  } catch (error) {
    ws.close(4003, 'Invalid token');
    return;
  }

  const { userId, email } = decoded;
  const agentId = resolveAgentForUser(email);
  const sessionKey = buildSessionKey(agentId, email);

  console.log(`🔗 User ${email} → agent ${agentId} (session: ${sessionKey})`);

  clientConnections.set(userId, ws);

  // Send connection confirmation
  ws.send(JSON.stringify({
    type: 'connected',
    userId,
    email,
    agentId,
    gatewayConnected: gateway.isConnected(),
    message: `Connected! Your messages go to ${agentId}.`,
    timestamp: new Date().toISOString(),
  }));

  // Accumulate streaming text per run
  const runBuffers = new Map(); // runId -> accumulated text
  let typingThrottle = 0;

  const sessionListener = (event) => {
    try {
      if (ws.readyState !== WsWebSocket.OPEN) return;

      if (event.state === 'delta') {
        // Accumulate text
        if (event.delta) {
          const current = runBuffers.get(event.runId) || '';
          runBuffers.set(event.runId, current + event.delta);
        }
        // Throttle typing indicators
        const now = Date.now();
        if (now - typingThrottle > 1000) {
          typingThrottle = now;
          ws.send(JSON.stringify({ type: 'typing', timestamp: new Date().toISOString() }));
        }
      } else if (event.state === 'agent-done') {
        // Agent lifecycle ended - send accumulated buffer if we have one and no final was sent
        const buffered = runBuffers.get(event.runId);
        if (buffered) {
          console.log(`✅ Agent done, sending buffered response (${buffered.length} chars)`);
          addMessageToHistory(userId, 'assistant', buffered);
          ws.send(JSON.stringify({
            type: 'message',
            data: { id: `msg-${Date.now()}`, content: buffered, sender: 'assistant', timestamp: new Date().toISOString(), read: false },
          }));
          runBuffers.delete(event.runId);
        }
      } else if (event.state === 'error') {
        ws.send(JSON.stringify({
          type: 'error',
          error: event.errorMessage || 'Agent error',
          timestamp: new Date().toISOString(),
        }));
        runBuffers.delete(event.runId);
      }
    } catch (e) {
      console.error('Error sending to client:', e);
    }
  };

  gateway.onSession(sessionKey, sessionListener);

  // Handle incoming messages
  ws.on('message', async (data) => {
    try {
      const msg = JSON.parse(data.toString());

      if (msg.type === 'message' && msg.content) {
        // Save to local history
        addMessageToHistory(userId, 'user', msg.content);

        if (!gateway.isConnected()) {
          ws.send(JSON.stringify({
            type: 'message',
            data: {
              id: `msg-${Date.now()}`,
              content: '⚠️ Gateway disconnected. Message saved locally, will be sent when reconnected.',
              sender: 'system',
              timestamp: new Date().toISOString(),
              read: true,
            },
          }));
          return;
        }

        console.log(`📨 ${email} → ${agentId}: "${msg.content.substring(0, 80)}"`);

        try {
          const runId = await gateway.sendChat(sessionKey, msg.content);
          console.log(`🚀 Chat sent, runId: ${runId}`);
        } catch (err) {
          console.error('Failed to send to gateway:', err.message);
          ws.send(JSON.stringify({
            type: 'error',
            error: `Failed to send message: ${err.message}`,
            timestamp: new Date().toISOString(),
          }));
        }
      }
    } catch (error) {
      ws.send(JSON.stringify({
        type: 'error',
        error: 'Invalid message format',
        timestamp: new Date().toISOString(),
      }));
    }
  });

  ws.on('close', () => {
    console.log(`🔌 WebSocket closed for ${email}`);
    gateway.offSession(sessionKey);
    clientConnections.delete(userId);
  });

  ws.on('error', (error) => {
    console.error(`WebSocket error for ${email}:`, error.message);
    gateway.offSession(sessionKey);
    clientConnections.delete(userId);
  });
});

// ==================== ERROR HANDLING ====================

app.use((err, req, res, next) => {
  console.error('Error:', err);
  res.status(500).json({ error: 'Internal server error' });
});

// ==================== START ====================

async function start() {
  try {
    await initUsers();

    // Connect to OpenClaw Gateway
    try {
      await gateway.connect();
    } catch (err) {
      console.warn('⚠️ Gateway connection failed (will retry):', err.message);
    }

    server.listen(PORT, () => {
      console.log(`
╔══════════════════════════════════════════════╗
║  OpenClaw Client Backend v2.0                ║
║  ✅ Running on port ${PORT}                   ║
║  📍 http://37.60.228.219:${PORT}              ║
║  🔐 JWT Auth enabled                         ║
║  🔌 Gateway: ${gateway.isConnected() ? '✅ Connected' : '⚠️  Reconnecting'}              ║
║  🤖 Bindings:                                ║
║     mathieu@ → agent-mathieu                 ║
║     tania@ → agent-tania                     ║
║     ezekiel@ → agent-ezekiel                ║
╚══════════════════════════════════════════════╝
      `);
    });
  } catch (error) {
    console.error('Failed to start server:', error);
    process.exit(1);
  }
}

start();

process.on('SIGTERM', () => {
  console.log('SIGTERM received, shutting down gracefully');
  server.close(() => process.exit(0));
});

export { users };
