import * as userService from '../services/userService.js';
import * as workService from '../services/workService.js';
import { sendSuccess, sendError } from '../utils/responses.js';
import { HTTP_STATUS } from '../config/constants.js';
import { validateRatingScore, validateUsername, validatePassword } from '../utils/validators.js';
import { catchAsync } from '../utils/catchAsync.js';

/**
 * Get all users
 * @route GET /api/users
 */
// eslint-disable-next-line no-unused-vars
export const getAllUsers = catchAsync(async (_req, res) => {
  const users = await userService.getAllUsers();
  sendSuccess(res, HTTP_STATUS.OK, users);
});

/**
 * Get user by ID
 * @route GET /api/users/:userId
 */
export const getUserById = catchAsync(async (req, res) => {
  const { userId } = req.params;
  const user = await userService.getUserById(userId);

  if (!user) {
    return sendError(res, HTTP_STATUS.NOT_FOUND, 'User not found');
  }

  sendSuccess(res, HTTP_STATUS.OK, user);
});

/**
 * Create new user
 * @route POST /api/users
 */
export const createUser = catchAsync(async (req, res) => {
  const { username, email, password, profilePictureUrl } = req.body;

  // Validate username
  const usernameValidation = validateUsername(username);
  if (!usernameValidation.valid) {
    return sendError(res, HTTP_STATUS.BAD_REQUEST, 'Invalid input', usernameValidation.errors);
  }

  // Validate password
  const passwordValidation = validatePassword(password);
  if (!passwordValidation.valid) {
    return sendError(res, HTTP_STATUS.BAD_REQUEST, 'Invalid input', passwordValidation.errors);
  }

  // Validate email
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
    if (error.message.includes('already exists')) {
      return sendError(res, HTTP_STATUS.BAD_REQUEST, error.message);
    }
    throw error;
  }
});

/**
 * Update user
 * @route PUT /api/users/:userId
 */
export const updateUser = catchAsync(async (req, res) => {
  const { userId } = req.params;
  const { username, email, password, profilePictureUrl } = req.body;

  // Validate username if provided
  if (username) {
    const usernameValidation = validateUsername(username);
    if (!usernameValidation.valid) {
      return sendError(res, HTTP_STATUS.BAD_REQUEST, 'Invalid input', usernameValidation.errors);
    }
  }

  // Validate password if provided
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
    if (error.message.includes('already exists')) {
      return sendError(res, HTTP_STATUS.BAD_REQUEST, error.message);
    }
    throw error;
  }
});

/**
 * Delete user
 * @route DELETE /api/users/:userId
 */
export const deleteUser = catchAsync(async (req, res) => {
  const { userId } = req.params;
  const deleted = await userService.deleteUser(userId);

  if (!deleted) {
    return sendError(res, HTTP_STATUS.NOT_FOUND, 'User not found');
  }

  res.status(HTTP_STATUS.NO_CONTENT).send();
});

/**
 * Get user's ratings
 * @route GET /api/users/:userId/ratings
 */
export const getUserRatings = catchAsync(async (req, res) => {
  const { userId } = req.params;
  const ratings = await userService.getUserRatings(userId);

  if (ratings === null) {
    return sendError(res, HTTP_STATUS.NOT_FOUND, 'User not found');
  }

  sendSuccess(res, HTTP_STATUS.OK, ratings);
});

/**
 * Add user rating for a work
 * @route POST /api/users/:userId/ratings
 */
export const addUserRating = catchAsync(async (req, res) => {
  const { userId } = req.params;
  const { workId, score } = req.body;

  // Validate required fields
  if (!workId) {
    return sendError(res, HTTP_STATUS.BAD_REQUEST, 'Invalid input', ['workId is required']);
  }

  // Validate score
  const scoreValidation = validateRatingScore(score);
  if (!scoreValidation.valid) {
    return sendError(res, HTTP_STATUS.BAD_REQUEST, 'Invalid input', scoreValidation.errors);
  }

  const rating = await userService.addUserRating(userId, workId, score);

  if (!rating) {
    return sendError(res, HTTP_STATUS.NOT_FOUND, 'User not found');
  }

  sendSuccess(res, HTTP_STATUS.OK, rating, 'Work rated successfully');
});

/**
 * Get user recommendations
 * @route GET /api/users/:userId/recommendations
 */
export const getUserRecommendations = catchAsync(async (req, res) => {
  const { userId } = req.params;

  // Check if user exists
  const user = await userService.getUserById(userId);
  if (!user) {
    return sendError(res, HTTP_STATUS.NOT_FOUND, 'User not found');
  }

  // Get all works to randomize
  const allWorks = await workService.getAllWorks();

  // Shuffle and pick random works
  const shuffled = [...allWorks].sort(() => Math.random() - 0.5);
  const current = shuffled.slice(0, 5);
  const profile = shuffled.slice(5, 10);

  // Get recommendation version for this user
  const version = await userService.getRecommendationVersion(userId);

  const recommendations = {
    current,
    profile,
    version // Include version so frontend can detect changes
  };

  sendSuccess(res, HTTP_STATUS.OK, recommendations, 'Recommendations retrieved');
});

/**
 * Get users that a user is following
 * @route GET /api/users/:userId/following
 */
export const getUserFollowing = catchAsync(async (req, res) => {
  const { userId } = req.params;

  try {
    const following = await userService.getUserFollowing(userId);
    sendSuccess(res, HTTP_STATUS.OK, { following });
  } catch (error) {
    if (error.message === 'User not found') {
      return sendError(res, HTTP_STATUS.NOT_FOUND, error.message);
    }
    throw error;
  }
});

/**
 * Get users that follow a user
 * @route GET /api/users/:userId/followers
 */
export const getUserFollowers = catchAsync(async (req, res) => {
  const { userId } = req.params;

  try {
    const followers = await userService.getUserFollowers(userId);
    sendSuccess(res, HTTP_STATUS.OK, { followers });
  } catch (error) {
    if (error.message === 'User not found') {
      return sendError(res, HTTP_STATUS.NOT_FOUND, error.message);
    }
    throw error;
  }
});

/**
 * Follow a user
 * @route POST /api/users/:userId/following/:targetUserId
 */
export const followUser = catchAsync(async (req, res) => {
  const { userId, targetUserId } = req.params;

  try {
    const result = await userService.followUser(userId, targetUserId);
    sendSuccess(res, HTTP_STATUS.OK, result);
  } catch (error) {
    if (error.message === 'User not found') {
      return sendError(res, HTTP_STATUS.NOT_FOUND, error.message);
    }
    if (error.message === 'Cannot follow yourself' || error.message === 'Already following this user') {
      return sendError(res, HTTP_STATUS.BAD_REQUEST, error.message);
    }
    throw error;
  }
});

/**
 * Unfollow a user
 * @route DELETE /api/users/:userId/following/:targetUserId
 */
export const unfollowUser = catchAsync(async (req, res) => {
  const { userId, targetUserId } = req.params;

  try {
    const result = await userService.unfollowUser(userId, targetUserId);
    sendSuccess(res, HTTP_STATUS.OK, result);
  } catch (error) {
    if (error.message === 'User not found') {
      return sendError(res, HTTP_STATUS.NOT_FOUND, error.message);
    }
    if (error.message === 'Not following this user') {
      return sendError(res, HTTP_STATUS.BAD_REQUEST, error.message);
    }
    throw error;
  }
});
