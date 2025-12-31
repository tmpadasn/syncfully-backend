/**
 * Work Rating Routes
 * ==================
 *
 * Manage ratings associated with specific works.
 *
 * Base path: /api/works
 *
 * ─────────────────────────────────────────────────────────────────────────────
 * ENDPOINTS (3)
 * ─────────────────────────────────────────────────────────────────────────────
 *   GET    /:workId/ratings           - Get all ratings for work
 *   POST   /:workId/ratings           - Submit rating for work
 *   GET    /:workId/ratings/average   - Get average rating
 *
 * @module routes/workRatingRoutes
 * @see routes/workCrudRoutes      - Work CRUD operations
 * @see routes/workDiscoveryRoutes - Discovery features
 * @see routes/ratingRoutes        - Direct rating management
 */

import express from 'express';
import * as ratingController from '../controllers/ratingController.js';
import { validateRequiredFields, validateIdParam } from '../middleware/validation.js';

const router = express.Router();

/**
 * GET /api/works/:workId/ratings
 * ------------------------------
 * Returns all ratings submitted for this work.
 *
 * Alternative: Use GET /api/ratings with filtering.
 *
 * @access  Public
 * @param   {string} workId - Work ID
 * @returns {Object} 200 - { success: true, data: Rating[] }
 * @returns {Object} 404 - Work not found
 */
router.get(
    '/:workId/ratings',
    validateIdParam('workId'),
    ratingController.getWorkRatings
);

/**
 * POST /api/works/:workId/ratings
 * -------------------------------
 * Creates or updates a rating for this work.
 * Users can only have one rating per work (upsert behavior).
 *
 * @access  Public (should check authentication in production)
 * @param   {string} workId - Work ID to rate
 * @body    {number} userId - User ID submitting the rating
 * @body    {number} score  - Rating score (1-5, integer)
 * @returns {Object} 201 - { success: true, data: Rating }
 * @returns {Object} 404 - Work not found
 * @returns {Object} 400 - Invalid userId or score
 */
router.post(
    '/:workId/ratings',
    validateIdParam('workId'),
    validateRequiredFields(['userId', 'score']),
    ratingController.createWorkRating
);

/**
 * GET /api/works/:workId/ratings/average
 * --------------------------------------
 * Returns computed average rating and total rating count.
 * Useful for displaying work popularity.
 *
 * @access  Public
 * @param   {string} workId - Work ID
 * @returns {Object} 200 - { success: true, data: { workId, averageRating, totalRatings } }
 * @returns {Object} 404 - Work not found
 */
router.get(
    '/:workId/ratings/average',
    validateIdParam('workId'),
    ratingController.getWorkAverageRating
);

export default router;
