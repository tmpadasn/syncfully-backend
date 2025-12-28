/**
 * Shelf Routes
 *
 * Handles user collections (shelves) for organizing works.
 * Like playlists but for movies/books/music - users create named collections.
 * Note: User-specific shelf operations also available at /api/users/:userId/shelves
 * Base path: /api/shelves
 */

import express from 'express';
import * as shelfController from '../controllers/shelfController.js';
import { validateIdParam } from '../middleware/validation.js';

const router = express.Router();

// ============================================================================
// Shelf CRUD Operations
// ============================================================================

/**
 * Get All Shelves
 *
 * Returns all shelves across all users.
 * Intended for admin/analytics purposes.
 *
 * @route   GET /api/shelves
 * @access  Public (should be admin-only in production)
 * @returns {Array} 200 - Array of all shelf objects
 */
router.get('/', shelfController.getAllShelves);

/**
 * Get Shelf By ID
 *
 * Retrieves detailed information for a specific shelf.
 * Includes shelf metadata and list of works.
 *
 * @route   GET /api/shelves/:shelfId
 * @access  Public
 * @param   {string} shelfId - Shelf ID (positive integer)
 * @returns {Object} 200 - Shelf object with works array
 * @returns {Object} 404 - Shelf not found
 * @returns {Object} 400 - Invalid shelf ID format
 */
router.get(
    '/:shelfId',
    validateIdParam('shelfId'),
    shelfController.getShelfById
);

/**
 * Update Shelf
 *
 * Modifies shelf name and/or description.
 * Cannot change shelf owner (userId).
 *
 * @route   PUT /api/shelves/:shelfId
 * @access  Public (should check ownership in production)
 * @param   {string} shelfId - Shelf ID
 * @body    {string} [name] - New shelf name (1-50 chars, unique per user)
 * @body    {string} [description] - New description (max 500 chars)
 * @returns {Object} 200 - Updated shelf object
 * @returns {Object} 404 - Shelf not found
 * @returns {Object} 400 - Invalid name (empty or duplicate) or description too long
 */
router.put(
    '/:shelfId',
    validateIdParam('shelfId'),
    shelfController.updateShelf
);

/**
 * Delete Shelf
 *
 * Removes shelf and its work associations.
 * Does not delete the works themselves.
 *
 * @route   DELETE /api/shelves/:shelfId
 * @access  Public (should check ownership in production)
 * @param   {string} shelfId - Shelf ID
 * @returns {Object} 204 - No content (success)
 * @returns {Object} 404 - Shelf not found
 */
router.delete(
    '/:shelfId',
    validateIdParam('shelfId'),
    shelfController.deleteShelf
);

// ============================================================================
// Shelf Works Management
// ============================================================================

/**
 * Get Shelf Works
 *
 * Returns all works in the shelf with optional filtering.
 * Supports filtering by work type, genre, rating, and year.
 *
 * @route   GET /api/shelves/:shelfId/works
 * @access  Public
 * @param   {string} shelfId - Shelf ID
 * @query   {string} [work-type] - Filter by work type (movie, book, etc.)
 * @query   {string} [genre] - Filter by genre
 * @query   {number} [rating] - Filter by minimum rating
 * @query   {number} [year] - Filter by minimum year
 * @returns {Object} 200 - Shelf object with filtered works array
 * @returns {Object} 404 - Shelf not found
 * @returns {Object} 400 - Invalid filter values
 */
router.get(
    '/:shelfId/works',
    validateIdParam('shelfId'),
    shelfController.getShelfWorks
);

/**
 * Add Work To Shelf
 *
 * Adds a work to the shelf's collection.
 * Prevents duplicate additions (idempotent operation).
 *
 * @route   POST /api/shelves/:shelfId/works/:workId
 * @access  Public (should check ownership in production)
 * @param   {string} shelfId - Shelf ID
 * @param   {string} workId - Work ID to add
 * @returns {Object} 200 - Updated shelf object
 * @returns {Object} 404 - Shelf or work not found
 * @returns {Object} 400 - Invalid shelf or work ID
 */
router.post(
    '/:shelfId/works/:workId',
    validateIdParam('shelfId'),
    validateIdParam('workId'),
    shelfController.addWorkToShelf
);

/**
 * Remove Work From Shelf
 *
 * Removes a work from the shelf's collection.
 * Does not delete the work itself.
 * Idempotent - safe to call even if work not in shelf.
 *
 * @route   DELETE /api/shelves/:shelfId/works/:workId
 * @access  Public (should check ownership in production)
 * @param   {string} shelfId - Shelf ID
 * @param   {string} workId - Work ID to remove
 * @returns {Object} 200 - Updated shelf object
 * @returns {Object} 404 - Shelf not found
 * @returns {Object} 400 - Invalid shelf or work ID
 */
router.delete(
    '/:shelfId/works/:workId',
    validateIdParam('shelfId'),
    validateIdParam('workId'),
    shelfController.removeWorkFromShelf
);

export default router;
