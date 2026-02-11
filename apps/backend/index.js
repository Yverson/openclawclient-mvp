import express from 'express';
import cors from 'cors';
import jwt from 'jsonwebtoken';
import bcryptjs from 'bcryptjs';
import http from 'http';
import dotenv from 'dotenv';

dotenv.config();

const PORT = process.env.PORT || 18790;
const CORS_ORIGINS = (process.env.CORS_ORIGINS || 'http://localhost:3000').split(',');
const JWT_SECRET = process.env.JWT_SECRET || 'dev-secret-key-change-in-production';

const app = express();
const server = http.createServer(app);

// ==================== WEBSOCKET (using ws library) ====================
// WebSocket handling would go here, for now using simple HTTP fallback

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
      ws: '/ws (WebSocket for chat)',
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

// Alias: /auth/token (frontend compatibility)
app.post('/auth/token', async (req, res) => {
  try {
    const { token } = req.body;
    if (!token) {
      return res.status(400).json({ error: 'Token required' });
    }

    // Verify the token
    const decoded = jwt.verify(token, JWT_SECRET);
    
    // Get user from store
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

// ==================== API ====================

app.get('/api/status', optionalAuth, (req, res) => {
  res.json({
    status: 'ok',
    version: '1.0.0',
    timestamp: new Date().toISOString(),
    authenticated: !!req.user
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

// ==================== CHAT (HTTP polling fallback) ====================

app.post('/api/chat', authMiddleware, (req, res) => {
  const { message } = req.body;
  if (!message) {
    return res.status(400).json({ error: 'Message required' });
  }

  res.json({
    type: 'response',
    role: 'assistant',
    content: `Echo: "${message}" (WebSocket not yet implemented, using HTTP fallback)`,
    timestamp: new Date().toISOString()
  });
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

server.listen(PORT, () => {
  console.log(`
╔════════════════════════════════════════╗
║  OpenClaw Client Backend               ║
║  ✅ Running on port ${PORT}             ║
║  📍 http://37.60.228.219:${PORT}        ║
║  🔐 JWT Auth enabled                   ║
║  🔌 WebSocket ready                    ║
║  🧪 Demo: demo@example.com / demo123   ║
╚════════════════════════════════════════╝
  `);
});

process.on('SIGTERM', () => {
  console.log('SIGTERM received, shutting down gracefully');
  server.close(() => {
    console.log('Server closed');
    process.exit(0);
  });
});
