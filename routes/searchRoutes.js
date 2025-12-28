/**
 * Search Routes
 *
 * Handles cross-resource search functionality.
 * Allows searching across works and users simultaneously or separately.
 * Base path: /api/search
 */

import express from 'express';
import searchController from '../controllers/searchController.js';

const router = express.Router();

/**
 * Universal Search Endpoint
 *
 * Searches across works and users based on query parameters.
 * Can filter by resource type, work attributes, and more.
 * Returns combined results or filtered by item-type.
 *
 * @route   GET /api/search
 * @access  Public
 * @query   {string} [query] - Search text (searches titles, names, descriptions)
 * @query   {string} [item-type] - Resource filter: 'work' or 'user' (searches both if omitted)
 * @query   {string} [work-type] - Work category filter: 'movie', 'book', 'music', 'series', 'graphic-novel'
 * @query   {string} [genre] - Genre filter (e.g., 'Action', 'Sci-Fi')
 * @query   {number} [rating] - Minimum rating filter (0-5)
 * @query   {number} [year] - Minimum year filter (e.g., 2020)
 * @returns {Object} 200 - { works: [], users: [] }
 * @returns {Object} 400 - Invalid query parameters
 *
 * @example
 * // Search everything for "inception"
 * GET /api/search?query=inception
 *
 * @example
 * // Search only movies with rating >= 4
 * GET /api/search?item-type=work&work-type=movie&rating=4
 *
 * @example
 * // Search users by username
 * GET /api/search?item-type=user&query=alice
 */
router.get('/', searchController.searchItems);

export default router;
