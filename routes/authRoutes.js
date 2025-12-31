/**
 * Authentication Routes - /api/auth
 * User authentication endpoints.
 */

import express from 'express';
import * as authController from '../controllers/authController.js';

const router = express.Router();

router.post('/login', authController.login);
router.post('/signup', authController.signup);

export default router;
