/**
 * Work CRUD Routes
 * =================
 *
 * Standard Create, Read, Update, Delete operations for works.
 *
 * Base path: /api/works
 *
 * ─────────────────────────────────────────────────────────────────────────────
 * ENDPOINTS (5)
 * ─────────────────────────────────────────────────────────────────────────────
 *   GET    /           - Get all works (with filters)
 *   POST   /           - Create new work
 *   GET    /:workId    - Get work by ID
 *   PUT    /:workId    - Update work
 *   DELETE /:workId    - Delete work
 *
 * @module routes/workCrudRoutes
 * @see routes/workDiscoveryRoutes - Popular and similar works
 * @see routes/workRatingRoutes    - Work ratings
 */

import express from 'express';
import * as workController from '../controllers/workController.js';
import { validateRequiredFields, validateIdParam } from '../middleware/validation.js';

const router = express.Router();

/**
 * GET /api/works
 * --------------
 * Returns all works with optional filtering.
 * Supports filtering by type, year, and genres.
 *
 * @access  Public
 * @query   {string} [type]   - Filter by work type (movie, book, music, etc.)
 * @query   {number} [year]   - Filter by minimum year
 * @query   {string} [genres] - Filter by genres (comma-separated or array)
 * @returns {Object} 200 - { success: true, data: Work[] }
 */
router.get('/', workController.getAllWorks);

/**
 * POST /api/works
 * ---------------
 * Adds new work to the system.
 * Title and type are required, other fields optional.
 *
 * @access  Public (should be admin-only in production)
 * @body    {string} title       - Work title
 * @body    {string} type        - Work type (movie, book, music, series, graphic-novel)
 * @body    {string} [description] - Optional description/synopsis
 * @body    {number} [year]      - Release/publication year
 * @body    {string[]} [genres]  - Array of genre tags
 * @body    {string} [creator]   - Author/director/artist name
 * @body    {string} [coverUrl]  - Cover image path
 * @body    {string} [foundAt]   - Where to find/watch/read
 * @returns {Object} 201 - { success: true, data: Work }
 * @returns {Object} 400 - Validation errors (missing title/type or invalid values)
 */
router.post(
    '/',
    validateRequiredFields(['title', 'type']),
    workController.createWork
);

/**
 * GET /api/works/:workId
 * ----------------------
 * Retrieves detailed information for a specific work.
 * Includes average rating calculated from all user ratings.
 *
 * @access  Public
 * @param   {string} workId - Work ID (positive integer)
 * @returns {Object} 200 - { success: true, data: Work }
 * @returns {Object} 404 - Work not found
 * @returns {Object} 400 - Invalid work ID format
 */
router.get(
    '/:workId',
    validateIdParam('workId'),
    workController.getWorkById
);

/**
 * PUT /api/works/:workId
 * ----------------------
 * Modifies work information.
 * All fields optional - only updates provided fields.
 *
 * @access  Public (should be admin-only in production)
 * @param   {string} workId - Work ID
 * @body    {string} [title]       - Updated title
 * @body    {string} [description] - Updated description
 * @body    {number} [year]        - Updated year
 * @body    {string[]} [genres]    - Updated genres array
 * @body    {string} [creator]     - Updated creator name
 * @body    {string} [coverUrl]    - Updated cover image path
 * @body    {string} [foundAt]     - Updated availability info
 * @returns {Object} 200 - { success: true, data: Work }
 * @returns {Object} 404 - Work not found
 * @returns {Object} 400 - Validation errors
 */
router.put(
    '/:workId',
    validateIdParam('workId'),
    workController.updateWork
);

/**
 * DELETE /api/works/:workId
 * -------------------------
 * Removes work from the system.
 * Cascades to delete ratings and removes from shelves.
 *
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

export default router;
