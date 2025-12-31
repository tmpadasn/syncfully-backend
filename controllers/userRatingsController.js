/**
 * =============================================================================
 * USER RATINGS CONTROLLER
 * =============================================================================
 * 
 * Handles user rating operations and recommendations.
 * Routes: /api/users/:userId/ratings and /api/users/:userId/recommendations
 * 
 * Dependencies:
 * - userService: Database operations for user ratings
 * - workService: Fetching works for recommendations
 * - validators: Rating score validation
 * - responses: Standardized API response helpers
 * 
 * @module controllers/userRatingsController
 */

import * as userService from '../services/userService.js';
import * as workService from '../services/workService.js';
import { sendSuccess, sendError } from '../utils/responses.js';
import { HTTP_STATUS } from '../config/constants.js';
import { validateRatingScore } from '../utils/validators.js';
import { catchAsync } from '../utils/catchAsync.js';

// =============================================================================
// USER RATINGS
// =============================================================================

/**
 * Get user's ratings
 * 
 * Retrieves all works rated by the specified user.
 * Returns an object mapping workId to rating data (score, ratedAt).
 * 
 * @route   GET /api/users/:userId/ratings
 * @access  Public
 * @param   {string} req.params.userId - User ID
 * @returns {Object} 200 - { workId: { score, ratedAt }, ... }
 * @returns {Object} 404 - User not found
 */
export const getUserRatings = catchAsync(async (req, res) => {
    const { userId } = req.params;
    const ratings = await userService.getUserRatings(userId);

    // null indicates user doesn't exist (vs empty object = no ratings)
    if (ratings === null) {
        return sendError(res, HTTP_STATUS.NOT_FOUND, 'User not found');
    }

    sendSuccess(res, HTTP_STATUS.OK, ratings);
});

/**
 * Add user rating for a work
 * 
 * Creates a new rating or updates an existing one.
 * Updates user's recommendationVersion for cache invalidation.
 * 
 * Score validation:
 * - Must be integer between 1-5 inclusive
 * 
 * @route   POST /api/users/:userId/ratings
 * @access  Public (should require auth in production)
 * @param   {string} req.params.userId - User ID
 * @body    {number} workId - Work ID to rate
 * @body    {number} score - Rating score (1-5, integer)
 * @returns {Object} 200 - Rating object with ratedAt timestamp
 * @returns {Object} 404 - User not found
 * @returns {Object} 400 - Invalid workId or score
 */
export const addUserRating = catchAsync(async (req, res) => {
    const { userId } = req.params;
    const { workId, score } = req.body;

    // Validate workId is provided
    if (!workId) {
        return sendError(res, HTTP_STATUS.BAD_REQUEST, 'Invalid input', ['workId is required']);
    }

    // Validate score is valid (1-5 integer)
    const scoreValidation = validateRatingScore(score);
    if (!scoreValidation.valid) {
        return sendError(res, HTTP_STATUS.BAD_REQUEST, 'Invalid input', scoreValidation.errors);
    }

    const rating = await userService.addUserRating(userId, workId, score);

    // null indicates user doesn't exist
    if (!rating) {
        return sendError(res, HTTP_STATUS.NOT_FOUND, 'User not found');
    }

    sendSuccess(res, HTTP_STATUS.OK, rating, 'Work rated successfully');
});

// =============================================================================
// RECOMMENDATIONS
// =============================================================================

/**
 * Get user recommendations
 * 
 * Returns personalized work recommendations for the user.
 * Currently uses randomized selection (placeholder for ML-based recommendations).
 * 
 * Response includes:
 * - current: 5 recommended works for "Now Playing"
 * - profile: 5 recommended works based on user profile
 * - version: Recommendation version for cache invalidation
 * 
 * @route   GET /api/users/:userId/recommendations
 * @access  Public
 * @param   {string} req.params.userId - User ID
 * @returns {Object} 200 - { current: [], profile: [], version: number }
 * @returns {Object} 404 - User not found
 */
export const getUserRecommendations = catchAsync(async (req, res) => {
    const { userId } = req.params;

    // Verify user exists before generating recommendations
    const user = await userService.getUserById(userId);
    if (!user) {
        return sendError(res, HTTP_STATUS.NOT_FOUND, 'User not found');
    }

    // Get all works for recommendation pool
    const allWorks = await workService.getAllWorks();

    // Shuffle works using Fisher-Yates-like random sort
    // TODO: Replace with collaborative filtering / content-based algorithm
    const shuffled = [...allWorks].sort(() => Math.random() - 0.5);

    // Split into two recommendation groups
    const current = shuffled.slice(0, 5);   // "Now Playing" recommendations
    const profile = shuffled.slice(5, 10);  // Profile-based recommendations

    // Get recommendation version for cache invalidation
    // Version increments when user rates new works
    const version = await userService.getRecommendationVersion(userId);

    const recommendations = {
        current,
        profile,
        version
    };

    sendSuccess(res, HTTP_STATUS.OK, recommendations, 'Recommendations retrieved');
});
