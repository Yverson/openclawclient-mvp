import express from 'express';
import cors from 'cors';
import dotenv from 'dotenv';
import expressWs from 'express-ws';
import { initDatabase } from './services/database.js';
import { gatewayClient } from './services/gateway.js';
import { authMiddleware, optionalAuthMiddleware } from './middleware/auth.js';
import authRoutes from './routes/auth.js';
import apiRoutes from './routes/api.js';
import { setupWebSocketRoutes } from './routes/ws.js';

dotenv.config();

const PORT = process.env.PORT || 18789;
const CORS_ORIGINS = (process.env.CORS_ORIGINS || 'http://localhost:3000,http://localhost:5173')
  .split(',')
  .map((origin) => origin.trim())
  .filter(Boolean);

const app = express();

// WebSocket support
const { app: wsApp } = expressWs(app);

// Middleware
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

// Request logging
app.use((req, res, next) => {
  console.log(`${new Date().toISOString()} ${req.method} ${req.path}`);
  next();
});

// Routes
app.use('/auth', authRoutes);
app.use('/api', optionalAuthMiddleware, apiRoutes);

// WebSocket routes
setupWebSocketRoutes(wsApp);

// Health check (public)
app.get('/health', (req, res) => {
  res.json({
    status: 'ok',
    timestamp: new Date().toISOString()
  });
});

// Root endpoint
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

// Error handling
app.use((err: any, req: express.Request, res: express.Response, next: express.NextFunction) => {
  console.error('Error:', err);
  res.status(500).json({
    error: 'Internal server error',
    message: process.env.NODE_ENV === 'development' ? err.message : undefined
  });
});

// Initialize and start
async function start() {
  try {
    console.log('🚀 Initializing database...');
    await initDatabase();
    console.log('✅ Database initialized');

    console.log('🔌 Connecting to OpenClaw Gateway...');
    try {
      await gatewayClient.connect();
      console.log('✅ Gateway connected');
    } catch (err: any) {
      console.warn('⚠️ Gateway connection failed (will retry):', err.message);
    }

    wsApp.listen(PORT, () => {
      console.log(`
╔════════════════════════════════════════╗
║  OpenClaw Client Backend               ║
║  ✅ Running on port ${PORT}             ║
║  📍 http://37.60.228.219:${PORT}        ║
║  🔐 JWT Auth enabled                   ║
║  🔌 WebSocket ready                    ║
╚════════════════════════════════════════╝
      `);
    });
  } catch (error) {
    console.error('Failed to start server:', error);
    process.exit(1);
  }
}

start();
