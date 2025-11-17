import express from 'express';
import * as ratingController from '../controllers/ratingController.js';
import { validateRequiredFields, validateIdParam } from '../middleware/validation.js';

const router = express.Router();

/**
 * @route   GET /api/ratings
 * @desc    Get all ratings (admin)
 * @access  Public
 */
router.get('/', ratingController.getAllRatings);

/**
 * @route   GET /api/ratings/:ratingId
 * @desc    Get rating by ID
 * @access  Public
 */
router.get(
    '/:ratingId',
    validateIdParam('ratingId'),
    ratingController.getRatingById
);

/**
 * @route   PUT /api/ratings/:ratingId
 * @desc    Update a rating
 * @access  Public
 */
router.put(
    '/:ratingId',
    validateIdParam('ratingId'),
    validateRequiredFields(['score']),
    ratingController.updateRating
);

/**
 * @route   DELETE /api/ratings/:ratingId
 * @desc    Delete a rating
 * @access  Public
 */
router.delete(
    '/:ratingId',
    validateIdParam('ratingId'),
    ratingController.deleteRating
);

export default router;
