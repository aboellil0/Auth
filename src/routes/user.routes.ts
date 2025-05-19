import express from 'express';
import { isAuthenticated, isVerified } from '../middlewares/auth.middleware';

const router = express.Router();

// Example protected route that requires email verification
router.get('/profile', isAuthenticated, isVerified, (req, res) => {
  res.json({ message: 'This is a protected route that requires email verification' });
});

export default router;
