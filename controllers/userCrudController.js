/**
 * =============================================================================
 * USER CRUD CONTROLLER
 * =============================================================================
 * 
 * Handles core user account management operations.
 * Routes: /api/users (list, create) and /api/users/:userId (get, update, delete)
 * 
 * Dependencies:
 * - userService: Database operations for users
 * - validators: Input validation for username/password
 * - responses: Standardized API response helpers
 * 
 * @module controllers/userCrudController
 */

import * as userService from '../services/userService.js';
import { sendSuccess, sendError } from '../utils/responses.js';
import { HTTP_STATUS } from '../config/constants.js';
import { validateUsername, validatePassword } from '../utils/validators.js';
import { catchAsync } from '../utils/catchAsync.js';

// =============================================================================
// LIST OPERATIONS
// =============================================================================

/**
 * Get all users
 * 
 * Retrieves a list of all registered users.
 * Passwords are excluded from the response by the service layer.
 * 
 * @route   GET /api/users
 * @access  Public
 * @returns {Array} 200 - Array of user objects
 */
// eslint-disable-next-line no-unused-vars
export const getAllUsers = catchAsync(async (_req, res) => {
    const users = await userService.getAllUsers();
    sendSuccess(res, HTTP_STATUS.OK, users);
});

/**
 * Get user by ID
 * 
 * Retrieves detailed information for a specific user.
 * Returns 404 if user doesn't exist.
 * 
 * @route   GET /api/users/:userId
 * @access  Public
 * @param   {string} req.params.userId - User ID (positive integer)
 * @returns {Object} 200 - User object
 * @returns {Object} 404 - User not found
 */
export const getUserById = catchAsync(async (req, res) => {
    const { userId } = req.params;
    const user = await userService.getUserById(userId);

    if (!user) {
        return sendError(res, HTTP_STATUS.NOT_FOUND, 'User not found');
    }

    sendSuccess(res, HTTP_STATUS.OK, user);
});

// =============================================================================
// CREATE OPERATION
// =============================================================================

/**
 * Create new user
 * 
 * Registers a new user account with validation:
 * - Username must be 3-20 characters, alphanumeric with underscores
 * - Password must be at least 6 characters
 * - Email must be unique
 * 
 * @route   POST /api/users
 * @access  Public
 * @body    {string} username - Unique username (3-20 chars)
 * @body    {string} email - Valid unique email address
 * @body    {string} password - Password (min 6 chars)
 * @body    {string} [profilePictureUrl] - Optional profile picture URL
 * @returns {Object} 201 - Created user object
 * @returns {Object} 400 - Validation errors or duplicate username/email
 */
export const createUser = catchAsync(async (req, res) => {
    const { username, email, password, profilePictureUrl } = req.body;

    // Validate username format
    const usernameValidation = validateUsername(username);
    if (!usernameValidation.valid) {
        return sendError(res, HTTP_STATUS.BAD_REQUEST, 'Invalid input', usernameValidation.errors);
    }

    // Validate password strength
    const passwordValidation = validatePassword(password);
    if (!passwordValidation.valid) {
        return sendError(res, HTTP_STATUS.BAD_REQUEST, 'Invalid input', passwordValidation.errors);
    }

    // Validate email is provided (format validation happens at service layer)
    if (!email) {
        return sendError(res, HTTP_STATUS.BAD_REQUEST, 'Invalid input', ['email is required']);
    }

    try {
        const user = await userService.createUser({
            username,
            email,
            password,
            profilePictureUrl
        });

        sendSuccess(res, HTTP_STATUS.CREATED, user, 'User successfully created');
    } catch (error) {
        // Handle duplicate username/email errors from database
        if (error.message.includes('already exists')) {
            return sendError(res, HTTP_STATUS.BAD_REQUEST, error.message);
        }
        throw error;
    }
});

// =============================================================================
// UPDATE OPERATION
// =============================================================================

/**
 * Update user
 * 
 * Modifies user account information. All fields are optional.
 * Only provided fields will be updated.
 * 
 * @route   PUT /api/users/:userId
 * @access  Public (should require auth in production)
 * @param   {string} req.params.userId - User ID to update
 * @body    {string} [username] - New username (must be unique)
 * @body    {string} [email] - New email (must be unique)
 * @body    {string} [password] - New password (min 6 chars)
 * @body    {string} [profilePictureUrl] - New profile picture URL
 * @returns {Object} 200 - Updated user object
 * @returns {Object} 404 - User not found
 * @returns {Object} 400 - Validation errors or duplicate username/email
 */
export const updateUser = catchAsync(async (req, res) => {
    const { userId } = req.params;
    const { username, email, password, profilePictureUrl } = req.body;

    // Validate username format if provided
    if (username) {
        const usernameValidation = validateUsername(username);
        if (!usernameValidation.valid) {
            return sendError(res, HTTP_STATUS.BAD_REQUEST, 'Invalid input', usernameValidation.errors);
        }
    }

    // Validate password strength if provided
    if (password) {
        const passwordValidation = validatePassword(password);
        if (!passwordValidation.valid) {
            return sendError(res, HTTP_STATUS.BAD_REQUEST, 'Invalid input', passwordValidation.errors);
        }
    }

    try {
        const user = await userService.updateUser(userId, {
            username,
            email,
            password,
            profilePictureUrl
        });

        if (!user) {
            return sendError(res, HTTP_STATUS.NOT_FOUND, 'User not found');
        }

        sendSuccess(res, HTTP_STATUS.OK, user, 'User information updated');
    } catch (error) {
        // Handle duplicate username/email errors from database
        if (error.message.includes('already exists')) {
            return sendError(res, HTTP_STATUS.BAD_REQUEST, error.message);
        }
        throw error;
    }
});

// =============================================================================
// DELETE OPERATION
// =============================================================================

/**
 * Delete user
 * 
 * Removes user account from the system.
 * Note: Cascading deletes for ratings, shelves, and follows
 * are handled at the service/database layer.
 * 
 * @route   DELETE /api/users/:userId
 * @access  Public (should require auth in production)
 * @param   {string} req.params.userId - User ID to delete
 * @returns {void} 204 - No content (success)
 * @returns {Object} 404 - User not found
 */
export const deleteUser = catchAsync(async (req, res) => {
    const { userId } = req.params;
    const deleted = await userService.deleteUser(userId);

    if (!deleted) {
        return sendError(res, HTTP_STATUS.NOT_FOUND, 'User not found');
    }

    // Return 204 No Content for successful deletion
    res.status(HTTP_STATUS.NO_CONTENT).send();
});
