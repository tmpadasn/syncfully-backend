/**
 * Authentication Routes
 *
 * Handles user authentication endpoints.
 * All routes are public (no authentication required to login/signup).
 * Base path: /api/auth
 */

import express from 'express';
import * as authController from '../controllers/authController.js';

const router = express.Router();

/**
 * Login Endpoint
 *
 * Authenticates user with username/email and password.
 * Returns user data on success.
 *
 * @route   POST /api/auth/login
 * @access  Public
 * @body    {string} identifier - Username or email
 * @body    {string} password - Plain text password
 * @returns {Object} 200 - User object
 * @returns {Object} 401 - Invalid credentials
 * @returns {Object} 400 - Missing fields
 */
router.post('/login', authController.login);

/**
 * Signup Endpoint
 *
 * Creates new user account.
 * Validates username/email uniqueness and password strength.
 *
 * @route   POST /api/auth/signup
 * @access  Public
 * @body    {string} username - Unique username (3-20 chars)
 * @body    {string} email - Valid email address
 * @body    {string} password - Password (min 6 chars)
 * @body    {string} [profilePictureUrl] - Optional profile picture
 * @returns {Object} 201 - Created user object
 * @returns {Object} 400 - Validation errors or duplicate username/email
 */
router.post('/signup', authController.signup);

export default router;
