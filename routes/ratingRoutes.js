/**
 * Rating Routes
 *
 * Handles direct rating operations (CRUD).
 * Note: Ratings can also be managed through /api/users/:userId/ratings
 * and /api/works/:workId/ratings for contextual access.
 * Base path: /api/ratings
 */

import express from 'express';
import * as ratingController from '../controllers/ratingController.js';
import { validateRequiredFields, validateIdParam } from '../middleware/validation.js';

const router = express.Router();

/**
 * Get All Ratings
 *
 * Returns all ratings in the system.
 * Intended for admin/analytics purposes.
 *
 * @route   GET /api/ratings
 * @access  Public (should be admin-only in production)
 * @returns {Array} 200 - Array of all rating objects
 */
router.get('/', ratingController.getAllRatings);

/**
 * Get Rating By ID
 *
 * Retrieves a specific rating.
 * Includes userId, workId, score, and timestamp.
 *
 * @route   GET /api/ratings/:ratingId
 * @access  Public
 * @param   {string} ratingId - Rating ID (validated as positive integer)
 * @returns {Object} 200 - Rating object
 * @returns {Object} 404 - Rating not found
 * @returns {Object} 400 - Invalid rating ID
 */
router.get(
    '/:ratingId',
    validateIdParam('ratingId'),
    ratingController.getRatingById
);

/**
 * Update Rating
 *
 * Modifies the score of an existing rating.
 * Updates the ratedAt timestamp automatically.
 *
 * @route   PUT /api/ratings/:ratingId
 * @access  Public (should check ownership in production)
 * @param   {string} ratingId - Rating ID
 * @body    {number} score - New rating score (1-5, integer)
 * @returns {Object} 200 - Updated rating object
 * @returns {Object} 404 - Rating not found
 * @returns {Object} 400 - Invalid score or rating ID
 */
router.put(
    '/:ratingId',
    validateIdParam('ratingId'),
    validateRequiredFields(['score']),
    ratingController.updateRating
);

/**
 * Delete Rating
 *
 * Removes a rating from the system.
 * Also removes from user's ratedWorks.
 *
 * @route   DELETE /api/ratings/:ratingId
 * @access  Public (should check ownership in production)
 * @param   {string} ratingId - Rating ID
 * @returns {Object} 204 - No content (success)
 * @returns {Object} 404 - Rating not found
 * @returns {Object} 400 - Invalid rating ID
 */
router.delete(
    '/:ratingId',
    validateIdParam('ratingId'),
    ratingController.deleteRating
);

export default router;
