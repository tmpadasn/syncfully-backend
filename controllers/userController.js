import * as userService from '../services/userService.js';
import * as workService from '../services/workService.js';
import { sendSuccess, sendError } from '../utils/responses.js';
import { HTTP_STATUS } from '../config/constants.js';
import { validateUserData, validateRatingScore } from '../utils/validators.js';

/**
 * Get all users
 * @route GET /api/users
 */
export const getAllUsers = async (req, res, next) => {
  try {
    const users = await userService.getAllUsers();
    sendSuccess(res, HTTP_STATUS.OK, users);
  } catch (error) {
    next(error);
  }
};

/**
 * Get user by ID
 * @route GET /api/users/:userId
 */
export const getUserById = async (req, res, next) => {
  try {
    const { userId } = req.params;
    const user = await userService.getUserById(userId);
    
    if (!user) {
      return sendError(res, HTTP_STATUS.NOT_FOUND, 'User not found');
    }
    
    sendSuccess(res, HTTP_STATUS.OK, user);
  } catch (error) {
    next(error);
  }
};

/**
 * Create new user
 * @route POST /api/users
 */
export const createUser = async (req, res, next) => {
  try {
    const { username, email, password, profilePictureUrl } = req.body;
    
    // Validate user data
    const validation = validateUserData({ username, email, password }, false);
    if (!validation.valid) {
      return sendError(res, HTTP_STATUS.BAD_REQUEST, 'Invalid input', validation.errors);
    }
    
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
    next(error);
  }
};

/**
 * Update user
 * @route PUT /api/users/:userId
 */
export const updateUser = async (req, res, next) => {
  try {
    const { userId } = req.params;
    const { username, email, password, profilePictureUrl } = req.body;
    
    // Validate user data (isUpdate = true makes fields optional)
    const validation = validateUserData({ username, email, password }, true);
    if (!validation.valid) {
      return sendError(res, HTTP_STATUS.BAD_REQUEST, 'Invalid input', validation.errors);
    }
    
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
    next(error);
  }
};

/**
 * Delete user
 * @route DELETE /api/users/:userId
 */
export const deleteUser = async (req, res, next) => {
  try {
    const { userId } = req.params;
    const deleted = await userService.deleteUser(userId);
    
    if (!deleted) {
      return sendError(res, HTTP_STATUS.NOT_FOUND, 'User not found');
    }
    
    res.status(HTTP_STATUS.NO_CONTENT).send();
  } catch (error) {
    next(error);
  }
};

/**
 * Get user's ratings
 * @route GET /api/users/:userId/ratings
 */
export const getUserRatings = async (req, res, next) => {
  try {
    const { userId } = req.params;
    const ratings = await userService.getUserRatings(userId);
    
    if (ratings === null) {
      return sendError(res, HTTP_STATUS.NOT_FOUND, 'User not found');
    }
    
    sendSuccess(res, HTTP_STATUS.OK, ratings);
  } catch (error) {
    next(error);
  }
};

/**
 * Add user rating for a work
 * @route POST /api/users/:userId/ratings
 */
export const addUserRating = async (req, res, next) => {
  try {
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
  } catch (error) {
    next(error);
  }
};

/**
 * Get user recommendations
 * @route GET /api/users/:userId/recommendations
 */
export const getUserRecommendations = async (req, res, next) => {
  try {
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
  } catch (error) {
    next(error);
  }
};