import express from 'express';
import * as authController from '../controllers/auth.controller';
import { isAuthenticated } from '../middlewares/auth.middleware';

const router = express.Router();

// Public routes
router.post('/register', authController.register);
router.post('/login', authController.login);
router.post('/logout', authController.logout);
router.post('/refresh-token', authController.refreshToken);
router.post('/verify-email', authController.verifyEmail);
router.post('/forgot-password', authController.forgotPassword);
router.post('/reset-password', authController.resetPassword);
router.post('/google', authController.googleLogin);
router.post('/facebook', authController.facebookLogin);

// Protected routes
router.get('/me', isAuthenticated, authController.getMe);
router.post('/verify-phone/send', isAuthenticated, authController.sendPhoneVerification);
router.post('/verify-phone', isAuthenticated, authController.verifyPhone);

export default router;