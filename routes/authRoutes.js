import express from 'express';
import * as authController from '../controllers/authController.js';

const router = express.Router();

/**
 * @route POST /api/auth/login
 * @desc  Log in (mock users only)
 * @access Public
 */
router.post('/login', authController.login);

/**
 * @route POST /api/auth/signup
 * @desc  Sign up (mock users)
 * @access Public
 */
router.post('/signup', authController.signup);

export default router;
