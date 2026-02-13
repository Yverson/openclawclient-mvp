import express from 'express';
import cors from 'cors';
import jwt from 'jsonwebtoken';
import bcryptjs from 'bcryptjs';
import http from 'http';
import { WebSocketServer, WebSocket } from 'ws';
import dotenv from 'dotenv';
import fs from 'fs';
import path from 'path';

dotenv.config();

const PORT = process.env.PORT || 18790;
const CORS_ORIGINS = (process.env.CORS_ORIGINS || '*').split(',').map(v => v.trim()).filter(Boolean);
const JWT_SECRET = process.env.JWT_SECRET || 'dev-secret-key-change-in-production';
const ENABLE_CHAT_FALLBACK = process.env.ENABLE_CHAT_FALLBACK !== '0';
const OPENCLAW_WSS_URL = process.env.OPENCLAW_WSS_URL || '';
const OPENCLAW_WSS_TOKEN = process.env.OPENCLAW_WSS_TOKEN || '';
const OPENCLAW_WSS_ENABLED = OPENCLAW_WSS_URL.startsWith('ws://') || OPENCLAW_WSS_URL.startsWith('wss://');
const OPENCLAW_WSS_ORIGIN = process.env.OPENCLAW_WSS_ORIGIN || `http://127.0.0.1:${process.env.OPENCLAW_GATEWAY_PORT || 18789}`;

const DATA_DIR = path.join(process.cwd(), 'data');
const USERS_FILE = path.join(DATA_DIR, 'users.json');
const CONVERSATIONS_FILE = path.join(DATA_DIR, 'conversations.json');
const AGENT_SESSIONS_FILE = path.join(DATA_DIR, 'agent_sessions.json');

const USER_BINDINGS = {
  'mathieu@gaddielcloud.com': { name: 'Mathieu', role: 'admin', agentId: 'agent-mathieu' },
  'tania@gaddielcloud.com': { name: 'Tania', role: 'user', agentId: 'agent-tania' },
  'ezekiel@gaddielcloud.com': { name: 'Ezekiel', role: 'user', agentId: 'agent-ezekiel' },
  'demo@example.com': { name: 'Demo User', role: 'user', agentId: 'agent-mathieu' }
};

if (!fs.existsSync(DATA_DIR)) fs.mkdirSync(DATA_DIR, { recursive: true });

function loadUsers() {
  try {
    if (fs.existsSync(USERS_FILE)) return JSON.parse(fs.readFileSync(USERS_FILE, 'utf8'));
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
    if (fs.existsSync(CONVERSATIONS_FILE)) return JSON.parse(fs.readFileSync(CONVERSATIONS_FILE, 'utf8'));
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

function loadAgentSessions() {
  try {
    if (fs.existsSync(AGENT_SESSIONS_FILE)) return JSON.parse(fs.readFileSync(AGENT_SESSIONS_FILE, 'utf8'));
  } catch (error) {
    console.error(`Error loading agent sessions: ${error.message}`);
  }
  return {};
}

function saveAgentSessions(sessions) {
  try {
    fs.writeFileSync(AGENT_SESSIONS_FILE, JSON.stringify(sessions, null, 2));
  } catch (error) {
    console.error(`Error saving agent sessions: ${error.message}`);
  }
}

function ensureAgentSession({ userId, email, agentId }) {
  const sessions = loadAgentSessions();
  const existing = sessions[userId];

  if (existing && existing.agentId === agentId) {
    existing.lastSeenAt = new Date().toISOString();
    sessions[userId] = existing;
    saveAgentSessions(sessions);
    return existing;
  }

  const created = {
    userId,
    email,
    agentId: agentId || 'agent-default',
    sessionId: `sess-${userId}-${Date.now()}`,
    createdAt: existing?.createdAt || new Date().toISOString(),
    lastSeenAt: new Date().toISOString()
  };

  sessions[userId] = created;
  saveAgentSessions(sessions);
  return created;
}

function addMessage(userId, role, content) {
  const conversations = loadConversations();
  if (!conversations[userId]) conversations[userId] = [];
  conversations[userId].push({
    id: `msg-${Date.now()}-${Math.random()}`,
    role,
    content,
    timestamp: new Date().toISOString()
  });
  saveConversations(conversations);
}

async function ensureDefaultUsers() {
  const users = loadUsers();
  const byEmail = new Map(users.map(u => [u.email.toLowerCase(), u]));

  const defaults = [
    ['demo@example.com', 'demo123'],
    ['mathieu@gaddielcloud.com', 'mathieu123'],
    ['tania@gaddielcloud.com', 'tania123'],
    ['ezekiel@gaddielcloud.com', 'ezekiel123']
  ];

  let mutated = false;
  for (const [email, password] of defaults) {
    if (!byEmail.has(email)) {
      const binding = USER_BINDINGS[email] || { name: email.split('@')[0], role: 'user', agentId: 'agent-default' };
      users.push({
        id: `user-${email.split('@')[0]}`,
        email,
        name: binding.name,
        role: binding.role,
        agentId: binding.agentId,
        password: await bcryptjs.hash(password, 10),
        createdAt: new Date().toISOString()
      });
      mutated = true;
    }
  }

  if (mutated) saveUsers(users);
}

function findUserByLogin(loginValue) {
  const login = String(loginValue || '').trim().toLowerCase();
  const users = loadUsers();
  const direct = users.find(u => u.email.toLowerCase() === login);
  if (direct) return direct;

  const aliasToEmail = {
    mathieu: 'mathieu@gaddielcloud.com',
    tania: 'tania@gaddielcloud.com',
    ezekiel: 'ezekiel@gaddielcloud.com'
  };

  const aliased = aliasToEmail[login];
  if (!aliased) return null;
  return users.find(u => u.email.toLowerCase() === aliased) || null;
}

function publicUser(user) {
  return {
    id: user.id,
    email: user.email,
    name: user.name || user.email.split('@')[0],
    role: user.role || 'user',
    agentId: user.agentId || 'agent-default',
    createdAt: user.createdAt || new Date().toISOString()
  };
}

const app = express();
const server = http.createServer(app);
const wss = new WebSocketServer({ server });

app.use(cors({
  origin: (origin, callback) => {
    if (!origin) return callback(null, true);
    if (CORS_ORIGINS.includes('*') || CORS_ORIGINS.includes(origin)) return callback(null, true);
    return callback(new Error('Not allowed by CORS'));
  },
  credentials: false
}));
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

function authMiddleware(req, res, next) {
  const authHeader = req.headers.authorization;
  if (!authHeader || !authHeader.startsWith('Bearer ')) return res.status(401).json({ error: 'Missing or invalid authorization header' });
  const token = authHeader.substring(7);
  try {
    req.user = jwt.verify(token, JWT_SECRET);
    next();
  } catch {
    return res.status(401).json({ error: 'Invalid token' });
  }
}

function optionalAuth(req, _res, next) {
  const authHeader = req.headers.authorization;
  if (authHeader?.startsWith('Bearer ')) {
    try { req.user = jwt.verify(authHeader.substring(7), JWT_SECRET); } catch {}
  }
  next();
}

app.use((req, _res, next) => {
  console.log(`${new Date().toISOString()} ${req.method} ${req.path}`);
  next();
});

app.get('/health', (_req, res) => res.json({ status: 'ok', timestamp: new Date().toISOString() }));

app.get('/', (_req, res) => {
  res.json({
    name: 'OpenClaw Client Backend',
    version: '1.0.0',
    status: 'running',
    endpoints: {
      auth: '/auth/login, /auth/register, /auth/me',
      api: '/api/status, /api/emails, /api/files, /api/dashboard',
      ws: '/ws/matrix (WebSocket for chat with Matrix)',
      health: '/health'
    }
  });
});

app.post('/auth/login', async (req, res) => {
  try {
    const { email, password } = req.body;
    if (!email || !password) return res.status(400).json({ error: 'Email and password required' });

    const user = findUserByLogin(email);
    if (!user) return res.status(401).json({ error: 'Invalid credentials' });

    const isValid = await bcryptjs.compare(password, user.password);
    if (!isValid) return res.status(401).json({ error: 'Invalid credentials' });

    const safeUser = publicUser(user);
    const token = jwt.sign(
      { userId: safeUser.id, email: safeUser.email, name: safeUser.name, role: safeUser.role, agentId: safeUser.agentId },
      JWT_SECRET,
      { expiresIn: '7d' }
    );

    res.json({ token, user: safeUser });
  } catch (error) {
    res.status(500).json({ error: error.message || 'Login failed' });
  }
});

app.post('/auth/register', async (req, res) => {
  try {
    const { email, password, name } = req.body;
    if (!email || !password) return res.status(400).json({ error: 'Email and password required' });

    const users = loadUsers();
    const normalizedEmail = String(email).toLowerCase();
    if (users.some(u => u.email.toLowerCase() === normalizedEmail)) return res.status(400).json({ error: 'User already exists' });

    const binding = USER_BINDINGS[normalizedEmail] || { name: name || normalizedEmail.split('@')[0], role: 'user', agentId: 'agent-default' };
    const created = {
      id: `user-${Date.now()}`,
      email: normalizedEmail,
      name: binding.name,
      role: binding.role,
      agentId: binding.agentId,
      password: await bcryptjs.hash(password, 10),
      createdAt: new Date().toISOString()
    };
    users.push(created);
    saveUsers(users);

    res.status(201).json(publicUser(created));
  } catch (error) {
    res.status(500).json({ error: error.message || 'Registration failed' });
  }
});

app.get('/auth/me', authMiddleware, (req, res) => {
  const users = loadUsers();
  const user = users.find(u => u.id === req.user.userId);
  if (!user) return res.status(404).json({ error: 'User not found' });
  res.json(publicUser(user));
});

app.post('/auth/token', (req, res) => {
  try {
    const { token } = req.body;
    if (!token) return res.status(400).json({ error: 'Token required' });
    const decoded = jwt.verify(token, JWT_SECRET);
    const users = loadUsers();
    const user = users.find(u => u.id === decoded.userId);
    if (!user) return res.status(401).json({ error: 'User not found' });
    res.json({ token, user: publicUser(user) });
  } catch {
    res.status(401).json({ error: 'Invalid token' });
  }
});

// Sticky agent session per user (isolated context)
app.get('/api/agent/session', authMiddleware, (req, res) => {
  const users = loadUsers();
  const user = users.find(u => u.id === req.user.userId);
  if (!user) return res.status(404).json({ error: 'User not found' });

  const session = ensureAgentSession({
    userId: user.id,
    email: user.email,
    agentId: user.agentId || 'agent-default'
  });

  res.json({ session });
});

// Admin can rebind a user to a dedicated agent id
app.post('/api/admin/users/:userId/agent', authMiddleware, (req, res) => {
  if (req.user.role !== 'admin') return res.status(403).json({ error: 'Admin only' });

  const { userId } = req.params;
  const { agentId } = req.body;
  if (!agentId) return res.status(400).json({ error: 'agentId required' });

  const users = loadUsers();
  const idx = users.findIndex(u => u.id === userId);
  if (idx < 0) return res.status(404).json({ error: 'User not found' });

  users[idx].agentId = agentId;
  saveUsers(users);

  const session = ensureAgentSession({ userId, email: users[idx].email, agentId });
  res.json({ success: true, user: publicUser(users[idx]), session });
});

app.get('/api/status', optionalAuth, (req, res) => {
  res.json({ status: 'ok', version: '1.0.0', timestamp: new Date().toISOString(), authenticated: !!req.user, matrix: '✅ Connected' });
});

app.get('/api/emails', authMiddleware, (req, res) => res.json([
  { id: '1', from: 'contact@example.com', to: req.user.email, subject: 'Welcome to OpenClaw Client', body: 'This is a welcome message', date: new Date(Date.now() - 86400000).toISOString() },
  { id: '2', from: 'support@example.com', to: req.user.email, subject: 'Your API Token', body: 'Here is your API token for integration', date: new Date(Date.now() - 43200000).toISOString() }
]));

app.get('/api/files', authMiddleware, (_req, res) => res.json([
  { id: '1', name: 'openclaw-architecture.pdf', size: 2048576, type: 'application/pdf', uploadedAt: new Date(Date.now() - 604800000).toISOString() },
  { id: '2', name: 'config.json', size: 4096, type: 'application/json', uploadedAt: new Date(Date.now() - 172800000).toISOString() },
  { id: '3', name: 'deployment-guide.md', size: 8192, type: 'text/markdown', uploadedAt: new Date().toISOString() }
]));

app.get('/api/dashboard', authMiddleware, (req, res) => {
  res.json({
    user: req.user,
    stats: { totalEmails: 24, totalFiles: 13, activeChats: 2, lastSync: new Date().toISOString() },
    recentActivity: [
      { type: 'email', action: 'received', timestamp: new Date(Date.now() - 300000).toISOString() },
      { type: 'file', action: 'uploaded', timestamp: new Date(Date.now() - 1800000).toISOString() }
    ]
  });
});

app.get('/api/chat/history', authMiddleware, (req, res) => {
  const conversations = loadConversations();
  const userHistory = conversations[req.user.userId] || [];
  res.json({ messages: userHistory.map(msg => ({ id: msg.id, content: msg.content, sender: msg.role === 'user' ? 'user' : 'assistant', timestamp: msg.timestamp, read: true })) });
});

const messageQueue = [];
const clientConnections = new Map();
let openclawWs = null;
let openclawReady = false;
let reconnectTimer = null;
let gatewayReqSeq = 0;
const gatewayPending = new Map();
const gatewaySessionUserMap = new Map(); // sessionKey -> userId
const gatewayLastTextBySessionKey = new Map(); // sessionKey -> last assistant text sent to client

function nextReqId() {
  gatewayReqSeq += 1;
  return `req-${Date.now()}-${gatewayReqSeq}`;
}

function makeGatewaySessionKey(agentId, sessionId) {
  return `agent:${agentId || 'agent-default'}:${sessionId}`;
}

function extractTextFromChatPayload(payload) {
  if (!payload) return '';
  const message = payload.message;
  if (typeof message === 'string') return message;
  if (typeof payload.content === 'string') return payload.content;

  if (Array.isArray(message)) {
    return message.map(part => (typeof part?.text === 'string' ? part.text : '')).join(' ').trim();
  }

  if (Array.isArray(message?.content)) {
    return message.content
      .map(part => (typeof part?.text === 'string' ? part.text : typeof part === 'string' ? part : ''))
      .join(' ')
      .trim();
  }

  if (typeof message?.text === 'string') return message.text;
  if (typeof message?.content === 'string') return message.content;
  return '';
}

function sendToUser(userId, content, sender = 'assistant') {
  addMessage(userId, sender === 'user' ? 'user' : 'assistant', content);
  const ws = clientConnections.get(userId);
  if (ws && ws.readyState === 1) {
    ws.send(JSON.stringify({
      type: 'message',
      data: { id: `msg-bridge-${Date.now()}`, content, sender, timestamp: new Date().toISOString(), read: true }
    }));
  }
}

function gatewayRequest(method, params = {}, timeoutMs = 12000) {
  if (!openclawWs || openclawWs.readyState !== 1) {
    return Promise.reject(new Error('gateway not connected'));
  }

  const id = nextReqId();
  openclawWs.send(JSON.stringify({ type: 'req', id, method, params }));

  return new Promise((resolve, reject) => {
    const timer = setTimeout(() => {
      gatewayPending.delete(id);
      reject(new Error(`gateway timeout on ${method}`));
    }, timeoutMs);

    gatewayPending.set(id, {
      resolve: (payload) => {
        clearTimeout(timer);
        resolve(payload);
      },
      reject: (error) => {
        clearTimeout(timer);
        reject(error);
      }
    });
  });
}

async function sendGatewayConnect() {
  const params = {
    minProtocol: 3,
    maxProtocol: 3,
    client: {
      id: 'gateway-client',
      version: '1.0.0',
      platform: process.platform,
      mode: 'backend',
      instanceId: `backend-${process.pid}`
    },
    role: 'operator',
    scopes: ['operator.admin', 'operator.approvals', 'operator.pairing'],
    caps: [],
    auth: OPENCLAW_WSS_TOKEN ? { token: OPENCLAW_WSS_TOKEN } : undefined,
    userAgent: 'openclawclient-backend/1.0.0',
    locale: 'fr-FR'
  };

  await gatewayRequest('connect', params, 8000);
}

function handleGatewayEvent(evt) {
  if (evt?.event !== 'chat') return;
  const payload = evt?.payload;
  const sessionKey = payload?.sessionKey;
  if (!sessionKey) return;

  const userId = gatewaySessionUserMap.get(sessionKey);
  if (!userId) return;

  const text = extractTextFromChatPayload(payload);
  if (!text) return;

  // Gateways may emit different completion flags depending on protocol/version.
  // Prefer final messages, but fall back to emitting when no state is provided.
  const isFinal =
    payload?.state === 'final' ||
    payload?.state === 'completed' ||
    payload?.final === true ||
    payload?.done === true ||
    payload?.isFinal === true ||
    payload?.state == null;

  if (!isFinal) return;

  const last = gatewayLastTextBySessionKey.get(sessionKey);
  if (last === text) return;
  gatewayLastTextBySessionKey.set(sessionKey, text);

  sendToUser(userId, text, 'assistant');
}

function connectOpenClawBridge() {
  if (!OPENCLAW_WSS_ENABLED) {
    console.log('ℹ️ OPENCLAW_WSS_URL non défini: bridge OpenClaw WSS désactivé');
    return;
  }

  try {
    openclawWs = new WebSocket(OPENCLAW_WSS_URL, {
      headers: {
        Origin: OPENCLAW_WSS_ORIGIN
      }
    });

    openclawWs.on('open', async () => {
      try {
        await sendGatewayConnect();
        openclawReady = true;
        console.log(`🔌 Connected to OpenClaw WSS: ${OPENCLAW_WSS_URL}`);
      } catch (e) {
        openclawReady = false;
        console.error('OpenClaw WSS connect/auth failed:', e?.message || e);
        openclawWs?.close();
      }
    });

    openclawWs.on('message', (raw) => {
      try {
        const msg = JSON.parse(String(raw));

        if (msg?.type === 'res' && msg?.id) {
          const pending = gatewayPending.get(msg.id);
          if (!pending) return;
          gatewayPending.delete(msg.id);
          if (msg.ok) pending.resolve(msg.payload);
          else pending.reject(new Error(msg?.error?.message || 'gateway request failed'));
          return;
        }

        if (msg?.type === 'event') {
          handleGatewayEvent(msg);
          return;
        }
      } catch (e) {
        console.error('OpenClaw WSS parse error:', e?.message || e);
      }
    });

    openclawWs.on('close', () => {
      openclawReady = false;
      for (const [id, pending] of gatewayPending.entries()) {
        pending.reject(new Error('gateway disconnected'));
        gatewayPending.delete(id);
      }
      console.warn('⚠️ OpenClaw WSS disconnected');
      if (reconnectTimer) clearTimeout(reconnectTimer);
      reconnectTimer = setTimeout(connectOpenClawBridge, 2000);
    });

    openclawWs.on('error', (err) => {
      openclawReady = false;
      console.error('OpenClaw WSS error:', err?.message || err);
    });
  } catch (error) {
    console.error('Failed to init OpenClaw WSS bridge:', error?.message || error);
  }
}

function dispatchToOpenClaw({ userId, content, agentId, sessionId }) {
  if (!OPENCLAW_WSS_ENABLED || !openclawReady || !openclawWs || openclawWs.readyState !== 1) {
    return false;
  }

  const sessionKey = makeGatewaySessionKey(agentId, sessionId);
  gatewaySessionUserMap.set(sessionKey, userId);

  gatewayRequest('chat.send', {
    sessionKey,
    message: content,
    deliver: false,
    idempotencyKey: `chat-${Date.now()}-${Math.random().toString(36).slice(2, 8)}`
  }).catch((e) => {
    console.error('chat.send failed:', e?.message || e);
  });

  return true;
}

app.get('/api/matrix/messages', (_req, res) => {
  const users = loadUsers();
  const conversations = loadConversations();

  const messages = messageQueue.map(msg => {
    const user = users.find(u => u.id === msg.userId);
    const targetAgentId = msg.agentId || user?.agentId || 'agent-default';
    const session = ensureAgentSession({ userId: msg.userId, email: msg.email || user?.email, agentId: targetAgentId });

    return {
      ...msg,
      user: user ? publicUser(user) : null,
      route: { agentId: targetAgentId, sessionId: session.sessionId },
      session,
      conversationHistory: conversations[msg.userId] || []
    };
  });

  messageQueue.length = 0;
  console.log(`📥 Matrix retrieved ${messages.length} messages with routing metadata`);
  res.json({ messages });
});

app.get('/api/conversations/:userId', authMiddleware, (req, res) => {
  const conversations = loadConversations();
  res.json({ messages: conversations[req.params.userId] || [] });
});

app.post('/api/matrix/respond', (req, res) => {
  try {
    const { userId, content, agentId, sessionId } = req.body;
    if (!userId || !content) return res.status(400).json({ error: 'userId and content required' });

    const users = loadUsers();
    const user = users.find(u => u.id === userId);
    if (!user) return res.status(404).json({ error: 'User not found' });

    const expectedAgentId = user.agentId || 'agent-default';
    if (agentId && agentId !== expectedAgentId) {
      return res.status(409).json({ error: `Agent mismatch for user ${userId}`, expected: expectedAgentId, received: agentId });
    }

    const session = ensureAgentSession({ userId, email: user.email, agentId: expectedAgentId });
    if (sessionId && sessionId !== session.sessionId) {
      return res.status(409).json({ error: `Session mismatch for user ${userId}`, expected: session.sessionId, received: sessionId });
    }

    addMessage(userId, 'assistant', content);

    const ws = clientConnections.get(userId);
    if (!ws || ws.readyState !== 1) {
      return res.status(202).json({ success: true, sessionId: session.sessionId, message: 'Response saved, will be delivered on reconnection' });
    }

    ws.send(JSON.stringify({
      type: 'message',
      data: { id: `msg-matrix-${Date.now()}`, content, sender: 'assistant', timestamp: new Date().toISOString(), read: true }
    }));

    res.json({ success: true, sessionId: session.sessionId });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

wss.on('connection', (ws, req) => {
  const url = new URL(req.url, `http://${req.headers.host}`);

  // Only accept WebSocket connections on the expected route
  if (url.pathname !== '/ws/matrix') {
    return ws.close(4004, 'Unknown WebSocket route');
  }

  const token = url.searchParams.get('token');
  if (!token) return ws.close(4001, 'Missing token');

  try {
    const decoded = jwt.verify(token, JWT_SECRET);
    clientConnections.set(decoded.userId, ws);
    const agentId = decoded.agentId || 'agent-default';
    const session = ensureAgentSession({ userId: decoded.userId, email: decoded.email, agentId });

    ws.send(JSON.stringify({
      type: 'connected',
      userId: decoded.userId,
      email: decoded.email,
      agentId,
      sessionId: session.sessionId,
      message: `Connected. Routed to ${agentId} (session ${session.sessionId}).`,
      timestamp: new Date().toISOString()
    }));

    ws.on('message', (data) => {
      try {
        const msg = JSON.parse(data.toString());
        if (msg.type === 'message' && msg.content) {
          addMessage(decoded.userId, 'user', msg.content);
          const agentId = decoded.agentId || 'agent-default';
          const session = ensureAgentSession({ userId: decoded.userId, email: decoded.email, agentId });
          messageQueue.push({ userId: decoded.userId, email: decoded.email, content: msg.content, agentId, sessionId: session.sessionId, timestamp: new Date().toISOString() });

          const bridged = dispatchToOpenClaw({
            userId: decoded.userId,
            email: decoded.email,
            content: msg.content,
            agentId,
            sessionId: session.sessionId
          });

          // Optional: emit a bridge status message back to the client UI.
          // Disabled by default to avoid noisy intermediate messages.
          if (process.env.SEND_BRIDGE_STATUS_MESSAGES === '1') {
            ws.send(JSON.stringify({
              type: 'message',
              data: {
                id: `msg-ack-${Date.now()}`,
                content: bridged
                  ? `⏳ Message envoyé à ${agentId} via OpenClaw WSS.`
                  : `⏳ Message en file d'attente pour ${agentId}.`,
                sender: 'system',
                timestamp: new Date().toISOString(),
                read: true
              }
            }));
          }

          // Local fallback reply only when WSS bridge is unavailable
          if (!bridged && ENABLE_CHAT_FALLBACK) {
            setTimeout(() => {
              const liveWs = clientConnections.get(decoded.userId);
              if (!liveWs || liveWs.readyState !== 1) return;

              const fallback = `🤖 Reçu: "${msg.content}"\n(Aucun agent backend actif pour répondre automatiquement.)`;
              addMessage(decoded.userId, 'assistant', fallback);
              liveWs.send(JSON.stringify({
                type: 'message',
                data: {
                  id: `msg-fallback-${Date.now()}`,
                  content: fallback,
                  sender: 'assistant',
                  timestamp: new Date().toISOString(),
                  read: true
                }
              }));
            }, 900);
          }
        }
      } catch {
        ws.send(JSON.stringify({ type: 'error', error: 'Invalid message format', timestamp: new Date().toISOString() }));
      }
    });

    ws.on('close', () => clientConnections.delete(decoded.userId));
    ws.on('error', (error) => console.error(`WebSocket error for user ${decoded.userId}:`, error));
  } catch {
    ws.close(4003, 'Invalid token');
  }
});

app.use((err, _req, res, _next) => {
  console.error('Error:', err);
  res.status(500).json({ error: 'Internal server error', message: process.env.NODE_ENV === 'development' ? err.message : undefined });
});

async function start() {
  try {
    await ensureDefaultUsers();
    connectOpenClawBridge();
    server.listen(PORT, () => console.log(`OpenClaw Client Backend running on :${PORT}`));
  } catch (error) {
    console.error('Failed to start server:', error);
    process.exit(1);
  }
}

start();

process.on('SIGTERM', () => {
  server.close(() => process.exit(0));
});

export { messageQueue };