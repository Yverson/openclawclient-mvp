import { Router, Response } from 'express';
import { AuthenticatedRequest } from '../middleware/auth.js';
import { Email, File } from '../types/index.js';

const router = Router();

// GET /api/status
router.get('/status', (req: AuthenticatedRequest, res: Response) => {
  res.json({
    status: 'ok',
    version: '1.0.0',
    timestamp: new Date().toISOString(),
    authenticated: !!req.user
  });
});

// GET /api/emails
router.get('/emails', (req: AuthenticatedRequest, res: Response) => {
  if (!req.user) {
    return res.status(401).json({ error: 'Not authenticated' });
  }

  // Mock emails
  const emails: Email[] = [
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

// GET /api/files
router.get('/files', (req: AuthenticatedRequest, res: Response) => {
  if (!req.user) {
    return res.status(401).json({ error: 'Not authenticated' });
  }

  // Mock files
  const files: File[] = [
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

// GET /api/dashboard
router.get('/dashboard', (req: AuthenticatedRequest, res: Response) => {
  if (!req.user) {
    return res.status(401).json({ error: 'Not authenticated' });
  }

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

export default router;
