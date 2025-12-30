/**
 * Authentication Controller
 * 
 * Handles user authentication operations including login and signup.
 * Uses service layer for business logic and utilities for validation/responses.
 * 
 * @module controllers/authController
 */

import { authenticateUser, createUser as createUserService } from '../services/userService.js';
import { sendSuccess, sendError } from '../utils/responses.js';
import { HTTP_STATUS } from '../config/constants.js';
import { validateUserData, validatePassword } from '../utils/validators.js';
import { catchAsync } from '../utils/catchAsync.js';

// ============================================================================
// VALIDATION HELPERS
// ============================================================================

/**
 * Validates login credentials are present.
 * @param {string} identifier - Username or email
 * @param {string} password - User password
 * @returns {{ valid: boolean, errors: string[] }}
 */
const validateLoginCredentials = (identifier, password) => {
  const errors = [];
  if (!identifier) errors.push('identifier is required');
  if (!password) errors.push('password is required');
  return { valid: errors.length === 0, errors };
};

/**
 * Validates all signup data including user data and password strength.
 * @param {Object} userData - User data object
 * @param {string} userData.username - Username
 * @param {string} userData.email - Email address
 * @param {string} userData.password - Password
 * @returns {{ valid: boolean, errors: string[], field?: string }}
 */
const validateSignupData = ({ username, email, password }) => {
  // Validate user data structure
  const userValidation = validateUserData({ username, email, password }, false);
  if (!userValidation.valid) {
    return { valid: false, errors: userValidation.errors, field: 'input' };
  }

  // Validate password strength
  const passwordValidation = validatePassword(password);
  if (!passwordValidation.valid) {
    return { valid: false, errors: passwordValidation.errors, field: 'password' };
  }

  // Validate email presence
  if (!email) {
    return { valid: false, errors: ['email is required'], field: 'email' };
  }

  return { valid: true, errors: [] };
};

// ============================================================================
// ERROR HANDLERS
// ============================================================================

/**
 * Handles signup-specific errors and sends appropriate response.
 * @param {Object} res - Express response object
 * @param {Error} error - Error to handle
 * @returns {Object|undefined} Response object or undefined if error should be rethrown
 */
const handleSignupError = (res, error) => {
  if (error.message.includes('already exists')) {
    return sendError(res, HTTP_STATUS.BAD_REQUEST, error.message);
  }
  if (error.message.includes('Invalid email format')) {
    return sendError(res, HTTP_STATUS.BAD_REQUEST, 'Invalid email format');
  }
  return null;
};

// ============================================================================
// ROUTE HANDLERS
// ============================================================================

/**
 * Authenticates a user with identifier (username/email) and password.
 * 
 * @route POST /api/auth/login
 * @body {Object} credentials
 * @body {string} credentials.identifier - Username or email
 * @body {string} credentials.password - User password
 * @returns {Object} User data on success
 * @throws {401} Invalid credentials
 * @throws {400} Missing required fields
 */
export const login = catchAsync(async (req, res) => {
  const { identifier, password } = req.body;

  // Validate credentials presence
  const validation = validateLoginCredentials(identifier, password);
  if (!validation.valid) {
    return sendError(
      res,
      HTTP_STATUS.BAD_REQUEST,
      'Missing required fields',
      validation.errors
    );
  }

  try {
    const user = await authenticateUser(identifier, password);
    return sendSuccess(res, HTTP_STATUS.OK, user, 'Login successful');
  } catch (authError) {
    return sendError(res, HTTP_STATUS.UNAUTHORIZED, authError.message);
  }
});

/**
 * Registers a new user account.
 * 
 * @route POST /api/auth/signup
 * @body {Object} userData
 * @body {string} userData.username - Unique username
 * @body {string} userData.email - Valid email address
 * @body {string} userData.password - Password meeting strength requirements
 * @body {string} [userData.profilePictureUrl] - Optional profile picture URL
 * @returns {Object} Created user data
 * @throws {400} Invalid input or user already exists
 */
export const signup = catchAsync(async (req, res) => {
  const { username, email, password, profilePictureUrl } = req.body;

  // Validate all signup data
  const validation = validateSignupData({ username, email, password });
  if (!validation.valid) {
    const message = validation.field === 'password' ? 'Invalid password' :
      validation.field === 'email' ? 'Invalid email' :
        'Invalid input';
    return sendError(res, HTTP_STATUS.BAD_REQUEST, message, validation.errors);
  }

  try {
    const user = await createUserService({
      username,
      email,
      password,
      profilePictureUrl
    });

    return sendSuccess(res, HTTP_STATUS.CREATED, user, 'User successfully created');
  } catch (error) {
    const handled = handleSignupError(res, error);
    if (handled) return handled;
    throw error;
  }
});
