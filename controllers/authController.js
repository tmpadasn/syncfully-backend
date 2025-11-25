import { authenticateUser, createUser } from '../services/userService.js';
import { sendSuccess, sendError } from '../utils/responses.js';
import { HTTP_STATUS } from '../config/constants.js';
import { validateUsername, validatePassword } from '../utils/validators.js';

/**
 * Simple LOGIN (no hashing, mock users only)
 * @route POST /api/auth/login
 * body: { identifier: string, password: string }
 */
export const login = async (req, res, next) => {
  try {
    const { identifier, password } = req.body;

    if (!identifier || !password) {
      return sendError(
        res,
        HTTP_STATUS.BAD_REQUEST,
        'identifier and password are required'
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
  } catch (error) {
    next(error);
  }
};

/**
 * Simple SIGNUP wrapper (uses existing createUser service)
 * @route POST /api/auth/signup
 * body: { username, email, password, profilePictureUrl? }
 */
export const signup = async (req, res, next) => {
  try {
    const { username, email, password, profilePictureUrl } = req.body;

    // reuse same validation logic as userController
    const usernameValidation = validateUsername(username);
    if (!usernameValidation.valid) {
      return sendError(
        res,
        HTTP_STATUS.BAD_REQUEST,
        'Invalid input',
        usernameValidation.errors
      );
    }

    const passwordValidation = validatePassword(password);
    if (!passwordValidation.valid) {
      return sendError(
        res,
        HTTP_STATUS.BAD_REQUEST,
        'Invalid input',
        passwordValidation.errors
      );
    }

    if (!email) {
      return sendError(
        res,
        HTTP_STATUS.BAD_REQUEST,
        'Invalid input',
        ['email is required']
      );
    }

    const user = await createUser({
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
    next(error);
  }
};
