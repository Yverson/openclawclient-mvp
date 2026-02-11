import { Request, Response, NextFunction } from 'express';
import { verifyToken } from '../services/auth.js';

export interface AuthenticatedRequest extends Request {
  user?: {
    userId: string;
    email: string;
  };
}

export function authMiddleware(req: AuthenticatedRequest, res: Response, next: NextFunction) {
  const authHeader = req.headers.authorization;
  
  if (!authHeader || !authHeader.startsWith('Bearer ')) {
    return res.status(401).json({ error: 'Missing or invalid authorization header' });
  }

  const token = authHeader.substring(7);
  
  try {
    const decoded = verifyToken(token);
    req.user = {
      userId: decoded.userId,
      email: decoded.email
    };
    next();
  } catch (error) {
    return res.status(401).json({ error: 'Invalid token' });
  }
}

export function optionalAuthMiddleware(req: AuthenticatedRequest, res: Response, next: NextFunction) {
  const authHeader = req.headers.authorization;
  
  if (authHeader && authHeader.startsWith('Bearer ')) {
    const token = authHeader.substring(7);
    try {
      const decoded = verifyToken(token);
      req.user = {
        userId: decoded.userId,
        email: decoded.email
      };
    } catch (error) {
      // Silently ignore invalid token in optional auth
    }
  }
  
  next();
}
