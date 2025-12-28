/**
 * Work Routes
 *
 * Handles media work operations (movies, books, music, series, graphic novels).
 * Includes CRUD operations, discovery features, and work-specific ratings.
 * Base path: /api/works
 */

import express from 'express';
import * as workController from '../controllers/workController.js';
import * as ratingController from '../controllers/ratingController.js';
import { validateRequiredFields, validateIdParam } from '../middleware/validation.js';

const router = express.Router();

// ============================================================================
// Discovery Endpoints (must be before /:workId to avoid param collision)
// ============================================================================

/**
 * Get Popular Works
 *
 * Returns trending/popular works based on rating and rating count.
 * Useful for homepage or discovery sections.
 *
 * @route   GET /api/works/popular
 * @access  Public
 * @returns {Array} 200 - Array of work objects sorted by popularity
 */
router.get('/popular', workController.getPopularWorks);

// ============================================================================
// Work CRUD Operations
// ============================================================================

/**
 * Get All Works
 *
 * Returns all works with optional filtering.
 * Supports filtering by type, year, and genres.
 *
 * @route   GET /api/works
 * @access  Public
 * @query   {string} [type] - Filter by work type (movie, book, music, etc.)
 * @query   {number} [year] - Filter by minimum year
 * @query   {string} [genres] - Filter by genres (comma-separated or array)
 * @returns {Array} 200 - Array of work objects with ratings
 */
router.get('/', workController.getAllWorks);

/**
 * Create Work
 *
 * Adds new work to the system.
 * Title and type are required, other fields optional.
 *
 * @route   POST /api/works
 * @access  Public (should be admin-only in production)
 * @body    {string} title - Work title
 * @body    {string} type - Work type (movie, book, music, series, graphic-novel)
 * @body    {string} [description] - Optional description/synopsis
 * @body    {number} [year] - Release/publication year
 * @body    {string[]} [genres] - Array of genre tags
 * @body    {string} [creator] - Author/director/artist name
 * @body    {string} [coverUrl] - Cover image path
 * @body    {string} [foundAt] - Where to find/watch/read
 * @returns {Object} 201 - Created work object
 * @returns {Object} 400 - Validation errors (missing title/type or invalid values)
 */
router.post(
    '/',
    validateRequiredFields(['title', 'type']),
    workController.createWork
);

/**
 * Get Work By ID
 *
 * Retrieves detailed information for a specific work.
 * Includes average rating calculated from all user ratings.
 *
 * @route   GET /api/works/:workId
 * @access  Public
 * @param   {string} workId - Work ID (positive integer)
 * @returns {Object} 200 - Work object with rating
 * @returns {Object} 404 - Work not found
 * @returns {Object} 400 - Invalid work ID format
 */
router.get(
    '/:workId',
    validateIdParam('workId'),
    workController.getWorkById
);

/**
 * Update Work
 *
 * Modifies work information.
 * All fields optional - only updates provided fields.
 *
 * @route   PUT /api/works/:workId
 * @access  Public (should be admin-only in production)
 * @param   {string} workId - Work ID
 * @body    {string} [title] - Updated title
 * @body    {string} [description] - Updated description
 * @body    {number} [year] - Updated year
 * @body    {string[]} [genres] - Updated genres array
 * @body    {string} [creator] - Updated creator name
 * @body    {string} [coverUrl] - Updated cover image path
 * @body    {string} [foundAt] - Updated availability info
 * @returns {Object} 200 - Updated work object
 * @returns {Object} 404 - Work not found
 * @returns {Object} 400 - Validation errors
 */
router.put(
    '/:workId',
    validateIdParam('workId'),
    workController.updateWork
);

/**
 * Delete Work
 *
 * Removes work from the system.
 * Should cascade delete ratings and remove from shelves.
 *
 * @route   DELETE /api/works/:workId
 * @access  Public (should be admin-only in production)
 * @param   {string} workId - Work ID
 * @returns {Object} 204 - No content (success)
 * @returns {Object} 404 - Work not found
 */
router.delete(
    '/:workId',
    validateIdParam('workId'),
    workController.deleteWork
);

// ============================================================================
// Work Discovery Features
// ============================================================================

/**
 * Get Similar Works
 *
 * Returns works similar to the specified work.
 * Similarity based on type and shared genres.
 * Useful for "You might also like" sections.
 *
 * @route   GET /api/works/:workId/similar
 * @access  Public
 * @param   {string} workId - Work ID to find similar works for
 * @returns {Array} 200 - Array of similar work objects (limited to 10)
 * @returns {Object} 404 - Work not found
 */
router.get(
    '/:workId/similar',
    validateIdParam('workId'),
    workController.getSimilarWorks
);

// ============================================================================
// Work Ratings (nested resource)
// ============================================================================

/**
 * Get Work Ratings
 *
 * Returns all ratings submitted for this work.
 * Alternative: Use /api/ratings with filtering.
 *
 * @route   GET /api/works/:workId/ratings
 * @access  Public
 * @param   {string} workId - Work ID
 * @returns {Array} 200 - Array of rating objects
 * @returns {Object} 404 - Work not found
 */
router.get(
    '/:workId/ratings',
    validateIdParam('workId'),
    ratingController.getWorkRatings
);

/**
 * Submit Work Rating
 *
 * Creates or updates a rating for this work.
 * Users can only have one rating per work (upsert behavior).
 *
 * @route   POST /api/works/:workId/ratings
 * @access  Public (should check authentication in production)
 * @param   {string} workId - Work ID to rate
 * @body    {number} userId - User ID submitting the rating
 * @body    {number} score - Rating score (1-5, integer)
 * @returns {Object} 201 - Created/updated rating object
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
 * Get Work Average Rating
 *
 * Returns computed average rating and total rating count.
 * Useful for displaying work popularity.
 *
 * @route   GET /api/works/:workId/ratings/average
 * @access  Public
 * @param   {string} workId - Work ID
 * @returns {Object} 200 - { workId, averageRating, totalRatings }
 * @returns {Object} 404 - Work not found
 */
router.get(
    '/:workId/ratings/average',
    validateIdParam('workId'),
    ratingController.getWorkAverageRating
);

export default router;
