import { authenticateUser, createUser as createUserService } from '../services/userService.js';
import { sendSuccess, sendError } from '../utils/responses.js';
import { HTTP_STATUS } from '../config/constants.js';
import { validateUserData, validatePassword } from '../utils/validators.js';
import { catchAsync } from '../utils/catchAsync.js';

/**
 * Simple LOGIN (no hashing, mock users only)
 * 
 * 1. Validates input
 * 2. Authenticates user
 * 3. Returns user data or error
 *
 * @route POST /api/auth/login
 * @body { identifier: string, password: string }
 */
export const login = catchAsync(async (req, res) => {
  const { identifier, password } = req.body;

  if (!identifier || !password) {
    return sendError(
      res,
      HTTP_STATUS.BAD_REQUEST,
      'Missing required fields',
      ['identifier and password are required']
    );
  }

  try {
    const user = await authenticateUser(identifier, password);
    // No session, no JWT – just return the user
    return sendSuccess(res, HTTP_STATUS.OK, user, 'Login successful');
  } catch (authError) {
    // authenticateUser throws specific errors for missing user or wrong password
    return sendError(res, HTTP_STATUS.UNAUTHORIZED, authError.message);
  }
});

/**
 * Simple SIGNUP wrapper (uses existing createUser service)
 * 
 * 1. Validates user data (username, email, password)
 * 2. Creates user
 * 3. Returns new user data
 *
 * @route POST /api/auth/signup
 * @body { username, email, password, profilePictureUrl? }
 */
export const signup = catchAsync(async (req, res) => {
  const { username, email, password, profilePictureUrl } = req.body;

  // Validate user data structure
  const validation = validateUserData({ username, email, password }, false);
  if (!validation.valid) {
    return sendError(
      res,
      HTTP_STATUS.BAD_REQUEST,
      'Invalid input',
      validation.errors
    );
  }

  // Validate password strength
  const passwordValidation = validatePassword(password);
  if (!passwordValidation.valid) {
    return sendError(
      res,
      HTTP_STATUS.BAD_REQUEST,
      'Invalid password',
      passwordValidation.errors
    );
  }

  // Explicit email check (redundant but safe)
  if (!email) {
    return sendError(
      res,
      HTTP_STATUS.BAD_REQUEST,
      'Invalid email',
      ['email is required']
    );
  }

  try {
    const user = await createUserService({
      username,
      email,
      password,
      profilePictureUrl
    });

    return sendSuccess(
      res,
      HTTP_STATUS.CREATED,
      user,
      'User successfully created'
    );
  } catch (error) {
    if (error.message.includes('already exists')) {
      return sendError(res, HTTP_STATUS.BAD_REQUEST, error.message);
    }
    if (error.message.includes('Invalid email format')) {
      return sendError(res, HTTP_STATUS.BAD_REQUEST, 'Invalid email format');
    }
    throw error;
  }
});
