import express from 'express';
import cors from 'cors';
import jwt from 'jsonwebtoken';
import bcryptjs from 'bcryptjs';
import http from 'http';
import { WebSocketServer } from 'ws';
import dotenv from 'dotenv';
import fs from 'fs';
import path from 'path';

dotenv.config();

const PORT = process.env.PORT || 18790;
const CORS_ORIGINS = (process.env.CORS_ORIGINS || 'http://localhost:3000').split(',');
const JWT_SECRET = process.env.JWT_SECRET || 'dev-secret-key-change-in-production';

// Data file paths
const DATA_DIR = path.join(process.cwd(), 'data');
const USERS_FILE = path.join(DATA_DIR, 'users.json');
const CONVERSATIONS_FILE = path.join(DATA_DIR, 'conversations.json');

// Ensure data directory exists
if (!fs.existsSync(DATA_DIR)) {
  fs.mkdirSync(DATA_DIR, { recursive: true });
}

// Load/Save functions
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

function addMessage(userId, role, content) {
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

const app = express();
const server = http.createServer(app);
const wss = new WebSocketServer({ server });

// Middleware
app.use(cors({
  origin: CORS_ORIGINS,
  credentials: true
}));
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Mock user store (in-memory for MVP)
const users = new Map();
users.set('demo@example.com', {
  id: 'user-1',
  email: 'demo@example.com',
  password: await bcryptjs.hash('demo123', 10)
});

// Middleware: Auth
function authMiddleware(req, res, next) {
  const authHeader = req.headers.authorization;
  if (!authHeader || !authHeader.startsWith('Bearer ')) {
    return res.status(401).json({ error: 'Missing or invalid authorization header' });
  }

  const token = authHeader.substring(7);
  try {
    const decoded = jwt.verify(token, JWT_SECRET);
    req.user = decoded;
    next();
  } catch (error) {
    return res.status(401).json({ error: 'Invalid token' });
  }
}

function optionalAuth(req, res, next) {
  const authHeader = req.headers.authorization;
  if (authHeader && authHeader.startsWith('Bearer ')) {
    const token = authHeader.substring(7);
    try {
      const decoded = jwt.verify(token, JWT_SECRET);
      req.user = decoded;
    } catch (error) {
      // Silently ignore
    }
  }
  next();
}

// Request logging
app.use((req, res, next) => {
  console.log(`${new Date().toISOString()} ${req.method} ${req.path}`);
  next();
});

// ==================== ROUTES ====================

// Health check
app.get('/health', (req, res) => {
  res.json({
    status: 'ok',
    timestamp: new Date().toISOString()
  });
});

// Root
app.get('/', (req, res) => {
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

    const token = jwt.sign(
      { userId: user.id, email: user.email },
      JWT_SECRET,
      { expiresIn: '7d' }
    );

    res.json({
      token,
      user: {
        id: user.id,
        email: user.email
      }
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
    users.set(email, {
      id,
      email,
      password: hashedPassword
    });

    res.status(201).json({
      id,
      email
    });
  } catch (error) {
    res.status(500).json({ error: error.message || 'Registration failed' });
  }
});

app.get('/auth/me', authMiddleware, (req, res) => {
  res.json({
    userId: req.user.userId,
    email: req.user.email
  });
});

// Alias: /auth/token (frontend compatibility)
app.post('/auth/token', async (req, res) => {
  try {
    const { token } = req.body;
    if (!token) {
      return res.status(400).json({ error: 'Token required' });
    }

    const decoded = jwt.verify(token, JWT_SECRET);
    const user = Array.from(users.values()).find(u => u.id === decoded.userId);
    if (!user) {
      return res.status(401).json({ error: 'User not found' });
    }

    res.json({
      token,
      user: {
        id: user.id,
        email: user.email
      }
    });
  } catch (error) {
    res.status(401).json({ error: 'Invalid token' });
  }
});

// ==================== API ====================

app.get('/api/status', optionalAuth, (req, res) => {
  res.json({
    status: 'ok',
    version: '1.0.0',
    timestamp: new Date().toISOString(),
    authenticated: !!req.user,
    matrix: '✅ Connected'
  });
});

app.get('/api/emails', authMiddleware, (req, res) => {
  const emails = [
    {
      id: '1',
      from: 'contact@example.com',
      to: req.user.email,
      subject: 'Welcome to OpenClaw Client',
      body: 'This is a welcome message',
      date: new Date(Date.now() - 1000 * 60 * 60 * 24).toISOString()
    },
    {
      id: '2',
      from: 'support@example.com',
      to: req.user.email,
      subject: 'Your API Token',
      body: 'Here is your API token for integration',
      date: new Date(Date.now() - 1000 * 60 * 60 * 12).toISOString()
    }
  ];
  res.json(emails);
});

app.get('/api/files', authMiddleware, (req, res) => {
  const files = [
    {
      id: '1',
      name: 'openclaw-architecture.pdf',
      size: 2048576,
      type: 'application/pdf',
      uploadedAt: new Date(Date.now() - 1000 * 60 * 60 * 24 * 7).toISOString()
    },
    {
      id: '2',
      name: 'config.json',
      size: 4096,
      type: 'application/json',
      uploadedAt: new Date(Date.now() - 1000 * 60 * 60 * 48).toISOString()
    },
    {
      id: '3',
      name: 'deployment-guide.md',
      size: 8192,
      type: 'text/markdown',
      uploadedAt: new Date().toISOString()
    }
  ];
  res.json(files);
});

app.get('/api/dashboard', authMiddleware, (req, res) => {
  res.json({
    user: req.user,
    stats: {
      totalEmails: 24,
      totalFiles: 13,
      activeChats: 2,
      lastSync: new Date().toISOString()
    },
    recentActivity: [
      { type: 'email', action: 'received', timestamp: new Date(Date.now() - 1000 * 60 * 5).toISOString() },
      { type: 'file', action: 'uploaded', timestamp: new Date(Date.now() - 1000 * 60 * 30).toISOString() }
    ]
  });
});

// API: Get chat history on load
app.get('/api/chat/history', authMiddleware, (req, res) => {
  const conversations = loadConversations();
  const userHistory = conversations[req.user.userId] || [];
  
  // Convert to frontend format
  const messages = userHistory.map(msg => ({
    id: msg.id,
    content: msg.content,
    sender: msg.role === 'user' ? 'user' : 'assistant',
    timestamp: msg.timestamp,
    read: true
  }));
  
  res.json({ messages });
});

// ==================== WEBSOCKET CHAT WITH MATRIX ====================

// Messages sent from app to Matrix (via server message queue)
const messageQueue = [];
const clientConnections = new Map(); // userId -> ws connection

// API: Get pending messages for Matrix (with FULL context)
app.get('/api/matrix/messages', (req, res) => {
  const messages = [];
  
  // Get messages with full context
  for (const msg of messageQueue) {
    const conversations = loadConversations();
    const userHistory = conversations[msg.userId] || [];
    const users = loadUsers();
    const user = users.find(u => u.id === msg.userId);
    
    messages.push({
      ...msg,
      user: user ? { id: user.id, email: user.email, name: user.name } : null,
      conversationHistory: userHistory // ALL messages for FULL context
    });
  }
  
  messageQueue.length = 0; // Clear queue
  console.log(`📥 Matrix retrieved ${messages.length} messages with FULL context`);
  res.json({ messages });
});

// API: Get conversation history
app.get('/api/conversations/:userId', authMiddleware, (req, res) => {
  const conversations = loadConversations();
  const userConversations = conversations[req.params.userId] || [];
  res.json({ messages: userConversations });
});

// API: Send response from Matrix to client (and save to history)
app.post('/api/matrix/respond', express.json(), (req, res) => {
  try {
    const { userId, content } = req.body;
    if (!userId || !content) {
      return res.status(400).json({ error: 'userId and content required' });
    }

    // Save assistant response to history
    addMessage(userId, 'assistant', content);

    const ws = clientConnections.get(userId);
    if (!ws || ws.readyState !== 1) {
      console.log(`⚠️ User ${userId} not connected, message queued for delivery`);
      return res.status(202).json({ 
        success: true, 
        message: 'Response saved, will be delivered on reconnection' 
      });
    }

    // Send response to client
    ws.send(JSON.stringify({
      type: 'message',
      data: {
        id: `msg-matrix-${Date.now()}`,
        content: content,
        sender: 'assistant',
        timestamp: new Date().toISOString(),
        read: true
      }
    }));

    console.log(`📤 Matrix response sent to ${userId}`);
    res.json({ success: true });
  } catch (error) {
    console.error(`Error sending response: ${error.message}`);
    res.status(500).json({ error: error.message });
  }
});

wss.on('connection', (ws, req) => {
  const url = new URL(req.url, `http://${req.headers.host}`);
  const token = url.searchParams.get('token');
  
  console.log(`WebSocket connection: ${req.url}`);
  
  if (!token) {
    console.log('WebSocket: Missing token');
    ws.close(4001, 'Missing token');
    return;
  }

  try {
    const decoded = jwt.verify(token, JWT_SECRET);
    console.log(`✅ WebSocket authenticated: user ${decoded.userId} (${decoded.email})`);
    
    // Store connection
    clientConnections.set(decoded.userId, ws);
    
    // Send connected message
    ws.send(JSON.stringify({
      type: 'connected',
      userId: decoded.userId,
      email: decoded.email,
      message: 'Connected to Matrix (Claude). Start chatting!',
      timestamp: new Date().toISOString()
    }));

    // Handle incoming messages from client
    ws.on('message', async (data) => {
      try {
        const rawData = data.toString();
        console.log(`📨 Client message: ${rawData}`);
        
        const msg = JSON.parse(rawData);
        
        if (msg.type === 'message' && msg.content) {
          // Save user message to history
          addMessage(decoded.userId, 'user', msg.content);
          
          // Queue message to Matrix
          messageQueue.push({
            userId: decoded.userId,
            email: decoded.email,
            content: msg.content,
            timestamp: new Date().toISOString()
          });

          // Send acknowledgment + info message
          ws.send(JSON.stringify({
            type: 'message',
            data: {
              id: `msg-ack-${Date.now()}`,
              content: '⏳ Message envoyé à Matrix. En attente de réponse...',
              sender: 'system',
              timestamp: new Date().toISOString(),
              read: true
            }
          }));

          console.log(`💾 Message saved + 📤 queued for Matrix: "${msg.content}"`);
        }
      } catch (error) {
        console.error(`❌ Message error: ${error.message}`);
        ws.send(JSON.stringify({
          type: 'error',
          error: 'Invalid message format',
          timestamp: new Date().toISOString()
        }));
      }
    });

    ws.on('close', () => {
      console.log(`🔌 WebSocket closed for user ${decoded.userId}`);
      clientConnections.delete(decoded.userId);
    });

    ws.on('error', (error) => {
      console.error(`⚠️  WebSocket error for user ${decoded.userId}:`, error);
    });
  } catch (error) {
    console.log(`❌ WebSocket auth error: ${error.message}`);
    ws.close(4003, 'Invalid token');
  }
});

// ==================== ERROR HANDLING ====================

app.use((err, req, res, next) => {
  console.error('Error:', err);
  res.status(500).json({
    error: 'Internal server error',
    message: process.env.NODE_ENV === 'development' ? err.message : undefined
  });
});

// ==================== START ====================

async function start() {
  try {
    server.listen(PORT, () => {
      console.log(`
╔════════════════════════════════════════╗
║  OpenClaw Client Backend               ║
║  ✅ Running on port ${PORT}             ║
║  📍 http://37.60.228.219:${PORT}        ║
║  🔐 JWT Auth enabled                   ║
║  🔌 WebSocket ready                    ║
║  💬 Connected to Matrix (Claude)       ║
║  🧪 Demo: demo@example.com / demo123   ║
╚════════════════════════════════════════╝
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
  server.close(() => {
    console.log('Server closed');
    process.exit(0);
  });
});

// Export messageQueue for external access
export { messageQueue, users };
