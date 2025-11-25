import express from 'express';
import * as shelfController from '../controllers/shelfController.js';
import { validateIdParam } from '../middleware/validation.js';

const router = express.Router();

/**
 * @route   GET /api/shelves
 * @desc    Get all shelves
 * @access  Public
 */
router.get('/', shelfController.getAllShelves);

/**
 * @route   GET /api/shelves/:shelfId
 * @desc    Get a specific shelf
 * @access  Public
 */
router.get(
    '/:shelfId',
    validateIdParam('shelfId'),
    shelfController.getShelfById
);

/**
 * @route   PUT /api/shelves/:shelfId
 * @desc    Update a specific shelf
 * @access  Public
 */
router.put(
    '/:shelfId',
    validateIdParam('shelfId'),
    shelfController.updateShelf
);

/**
 * @route   DELETE /api/shelves/:shelfId
 * @desc    Delete a specific shelf
 * @access  Public
 */
router.delete(
    '/:shelfId',
    validateIdParam('shelfId'),
    shelfController.deleteShelf
);

/**
 * @route   GET /api/shelves/:shelfId/works
 * @desc    Get all works in a shelf with optional filters
 * @access  Public
 */
router.get(
    '/:shelfId/works',
    validateIdParam('shelfId'),
    shelfController.getShelfWorks
);

/**
 * @route   POST /api/shelves/:shelfId/works/:workId
 * @desc    Add a work to a shelf
 * @access  Public
 */
router.post(
    '/:shelfId/works/:workId',
    validateIdParam('shelfId'),
    validateIdParam('workId'),
    shelfController.addWorkToShelf
);

/**
 * @route   DELETE /api/shelves/:shelfId/works/:workId
 * @desc    Remove a work from a shelf
 * @access  Public
 */
router.delete(
    '/:shelfId/works/:workId',
    validateIdParam('shelfId'),
    validateIdParam('workId'),
    shelfController.removeWorkFromShelf
);

export default router;
