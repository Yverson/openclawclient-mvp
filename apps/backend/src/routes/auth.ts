import { Router, Response } from 'express';
import { registerUser, loginUser } from '../services/auth.js';
import { AuthenticatedRequest } from '../middleware/auth.js';

const router = Router();

// POST /auth/login
router.post('/login', async (req: AuthenticatedRequest, res: Response) => {
  try {
    const { email, password } = req.body;
    
    if (!email || !password) {
      return res.status(400).json({ error: 'Email and password required' });
    }

    const result = await loginUser(email, password);
    res.json(result);
  } catch (error: any) {
    res.status(401).json({ error: error.message || 'Login failed' });
  }
});

// POST /auth/register
router.post('/register', async (req: AuthenticatedRequest, res: Response) => {
  try {
    const { email, password } = req.body;
    
    if (!email || !password) {
      return res.status(400).json({ error: 'Email and password required' });
    }

    const user = await registerUser(email, password);
    const { password: _, ...userWithoutPassword } = user;
    res.status(201).json(userWithoutPassword);
  } catch (error: any) {
    res.status(400).json({ error: error.message || 'Registration failed' });
  }
});

// GET /auth/me
router.get('/me', (req: AuthenticatedRequest, res: Response) => {
  if (!req.user) {
    return res.status(401).json({ error: 'Not authenticated' });
  }
  
  res.json({
    userId: req.user.userId,
    email: req.user.email
  });
});

export default router;
