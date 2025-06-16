import { Request, Response, NextFunction } from 'express';
import { verifyToken } from '../services/token.service';
import User from '../models/user.model';

export interface AuthRequest extends Request {
  user?: any;
}

export const isAuthenticated = async (req: AuthRequest, res: Response, next: NextFunction) => {
  try {
    const authHeader = req.headers.authorization;
    console.log('Auth Header:', authHeader); // Debug
    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      return res.status(401).json({ message: 'Access token is required' });
    }
    const token = authHeader.split(' ')[1];
    const decoded = verifyToken(token);
    console.log('Decoded Token:', decoded); // Debug
    const user = await User.findById(decoded.userId);
    if (!user) {
      return res.status(401).json({ message: 'User not found' });
    }
    req.user = user;
    next();
  } catch (error) {
    console.error('Auth Error:', error); // Debug
    return res.status(401).json({ message: 'Invalid or expired token' });
  }
};

export const isVerified = (req: AuthRequest, res: Response, next: NextFunction) => {
  if (!req.user.isEmailVerified) {
    return res.status(403).json({ message: 'Email not verified' });
  }
  next();
};

