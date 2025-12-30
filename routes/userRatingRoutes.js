/**
 * User Rating Routes
 * ==================
 *
 * Manage ratings and recommendations for users.
 *
 * Base path: /api/users
 *
 * ─────────────────────────────────────────────────────────────────────────────
 * ENDPOINTS (3)
 * ─────────────────────────────────────────────────────────────────────────────
 *   GET    /:userId/ratings           - Get user's ratings
 *   POST   /:userId/ratings           - Add/update rating
 *   GET    /:userId/recommendations   - Get personalized recommendations
 *
 * @module routes/userRatingRoutes
 * @see routes/userCrudRoutes   - User CRUD operations
 * @see routes/userSocialRoutes - Social features
 * @see routes/ratingRoutes     - Direct rating management
 */

import express from 'express';
import * as userRatingsController from '../controllers/userRatingsController.js';
import { validateRequiredFields, validateIdParam } from '../middleware/validation.js';

const router = express.Router();

/**
 * GET /api/users/:userId/ratings
 * ------------------------------
 * Returns all works rated by the user.
 * Returns object mapping workId to rating data.
 *
 * @access  Public
 * @param   {string} userId - User ID
 * @returns {Object} 200 - { success: true, data: { workId: { score, ratedAt } } }
 * @returns {Object} 404 - User not found
 */
router.get(
    '/:userId/ratings',
    validateIdParam('userId'),
    userRatingsController.getUserRatings
);

/**
 * POST /api/users/:userId/ratings
 * -------------------------------
 * Creates new rating or updates existing one.
 * Updates user's recommendationVersion for cache invalidation.
 *
 * @access  Public (should check ownership in production)
 * @param   {string} userId - User ID
 * @body    {number} workId - Work ID to rate
 * @body    {number} score  - Rating score (1-5, integer)
 * @returns {Object} 200 - { success: true, data: { workId, score, ratedAt } }
 * @returns {Object} 404 - User not found
 * @returns {Object} 400 - Invalid workId or score
 */
router.post(
    '/:userId/ratings',
    validateIdParam('userId'),
    validateRequiredFields(['workId', 'score']),
    userRatingsController.addUserRating
);

/**
 * GET /api/users/:userId/recommendations
 * --------------------------------------
 * Returns personalized work recommendations based on user's ratings.
 * Uses collaborative filtering and content-based algorithms.
 *
 * @access  Public
 * @param   {string} userId - User ID
 * @returns {Object} 200 - { success: true, data: Work[] }
 * @returns {Object} 404 - User not found
 */
router.get(
    '/:userId/recommendations',
    validateIdParam('userId'),
    userRatingsController.getUserRecommendations
);

export default router;
