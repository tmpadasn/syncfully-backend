import express from 'express';
import * as workController from '../controllers/workController.js';
import * as ratingController from '../controllers/ratingController.js';
import { validateRequiredFields, validateIdParam } from '../middleware/validation.js';

const router = express.Router();

/**
 * @route   GET /api/works/popular
 * @desc    Get popular works this week
 * @access  Public
 */
router.get('/popular', workController.getPopularWorks);

/**
 * @route   GET /api/works
 * @desc    Get all works (with optional filters)
 * @access  Public
 */
router.get('/', workController.getAllWorks);

/**
 * @route   POST /api/works
 * @desc    Create a new work
 * @access  Public
 */
router.post(
    '/',
    validateRequiredFields(['title', 'type']),
    workController.createWork
);

/**
 * @route   GET /api/works/:workId
 * @desc    Get work by ID
 * @access  Public
 */
router.get(
    '/:workId',
    validateIdParam('workId'),
    workController.getWorkById
);

/**
 * @route   PUT /api/works/:workId
 * @desc    Update work
 * @access  Public
 */
router.put(
    '/:workId',
    validateIdParam('workId'),
    workController.updateWork
);

/**
 * @route   DELETE /api/works/:workId
 * @desc    Delete work
 * @access  Public
 */
router.delete(
    '/:workId',
    validateIdParam('workId'),
    workController.deleteWork
);

/**
 * @route   GET /api/works/:workId/similar
 * @desc    Get similar works
 * @access  Public
 */
router.get(
    '/:workId/similar',
    validateIdParam('workId'),
    workController.getSimilarWorks
);

/**
 * @route   GET /api/works/:workId/ratings
 * @desc    Get all ratings for a work
 * @access  Public
 */
router.get(
    '/:workId/ratings',
    validateIdParam('workId'),
    ratingController.getWorkRatings
);

/**
 * @route   POST /api/works/:workId/ratings
 * @desc    Submit a rating for a work
 * @access  Public
 */
router.post(
    '/:workId/ratings',
    validateIdParam('workId'),
    validateRequiredFields(['userId', 'score']),
    ratingController.createWorkRating
);

/**
 * @route   GET /api/works/:workId/ratings/average
 * @desc    Get average rating for a work
 * @access  Public
 */
router.get(
    '/:workId/ratings/average',
    validateIdParam('workId'),
    ratingController.getWorkAverageRating
);

export default router;
