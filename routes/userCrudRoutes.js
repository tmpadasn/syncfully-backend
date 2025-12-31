/**
 * User CRUD Routes
 * =================
 *
 * Standard Create, Read, Update, Delete operations for user accounts.
 *
 * Base path: /api/users
 *
 * ─────────────────────────────────────────────────────────────────────────────
 * ENDPOINTS (5)
 * ─────────────────────────────────────────────────────────────────────────────
 *   GET    /           - Get all users
 *   POST   /           - Create new user
 *   GET    /:userId    - Get user by ID
 *   PUT    /:userId    - Update user
 *   DELETE /:userId    - Delete user
 *
 * @module routes/userCrudRoutes
 * @see routes/userRatingRoutes - User ratings and recommendations
 * @see routes/userSocialRoutes - Social features and shelves
 */

import express from 'express';
import * as userCrudController from '../controllers/userCrudController.js';
import { validateRequiredFields, validateIdParam } from '../middleware/validation.js';

const router = express.Router();

/**
 * GET /api/users
 * --------------
 * Returns list of all users in the system.
 * Excludes sensitive data (passwords).
 *
 * @access  Public
 * @returns {Object} 200 - { success: true, data: User[] }
 */
router.get('/', userCrudController.getAllUsers);

/**
 * POST /api/users
 * ---------------
 * Registers a new user account.
 * Validates username/email uniqueness and password strength.
 *
 * Alternative: Use POST /api/auth/signup for authentication context.
 *
 * @access  Public
 * @body    {string} username - Unique username (3-20 chars)
 * @body    {string} email    - Valid email address
 * @body    {string} password - Password (min 6 chars)
 * @body    {string} [profilePictureUrl] - Optional profile picture path
 * @returns {Object} 201 - { success: true, data: User }
 * @returns {Object} 400 - Validation errors or duplicate username/email
 */
router.post(
    '/',
    validateRequiredFields(['username', 'email', 'password']),
    userCrudController.createUser
);

/**
 * GET /api/users/:userId
 * ----------------------
 * Retrieves detailed information for a specific user.
 * Includes profile data and rated works count.
 *
 * @access  Public
 * @param   {string} userId - User ID (positive integer)
 * @returns {Object} 200 - { success: true, data: User }
 * @returns {Object} 404 - User not found
 * @returns {Object} 400 - Invalid user ID
 */
router.get(
    '/:userId',
    validateIdParam('userId'),
    userCrudController.getUserById
);

/**
 * PUT /api/users/:userId
 * ----------------------
 * Modifies user account information.
 * All fields are optional - only updates provided fields.
 *
 * @access  Public (should check ownership in production)
 * @param   {string} userId - User ID
 * @body    {string} [username] - New username (must be unique)
 * @body    {string} [email]    - New email (must be unique)
 * @body    {string} [password] - New password (min 6 chars)
 * @body    {string} [profilePictureUrl] - New profile picture path
 * @returns {Object} 200 - { success: true, data: User }
 * @returns {Object} 404 - User not found
 * @returns {Object} 400 - Validation errors or duplicate username/email
 */
router.put(
    '/:userId',
    validateIdParam('userId'),
    userCrudController.updateUser
);

/**
 * DELETE /api/users/:userId
 * -------------------------
 * Removes user account from the system.
 * Cascades to delete ratings, shelves, and follows.
 *
 * @access  Public (should check ownership in production)
 * @param   {string} userId - User ID
 * @returns {Object} 204 - No content (success)
 * @returns {Object} 404 - User not found
 */
router.delete(
    '/:userId',
    validateIdParam('userId'),
    userCrudController.deleteUser
);

export default router;
