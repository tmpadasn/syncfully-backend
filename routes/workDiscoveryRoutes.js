/**
 * Work Discovery Routes
 * =====================
 *
 * Discovery features for finding popular and similar works.
 *
 * Base path: /api/works
 *
 * ─────────────────────────────────────────────────────────────────────────────
 * ENDPOINTS (2)
 * ─────────────────────────────────────────────────────────────────────────────
 *   GET    /popular         - Get trending/popular works
 *   GET    /:workId/similar - Get similar works
 *
 * @module routes/workDiscoveryRoutes
 * @see routes/workCrudRoutes   - Work CRUD operations
 * @see routes/workRatingRoutes - Work ratings
 * @see routes/searchRoutes     - Cross-resource search
 */

import express from 'express';
import * as workController from '../controllers/workController.js';
import { validateIdParam } from '../middleware/validation.js';

const router = express.Router();

/**
 * GET /api/works/popular
 * ----------------------
 * Returns trending/popular works based on rating and rating count.
 * Useful for homepage or discovery sections.
 *
 * @access  Public
 * @returns {Object} 200 - { success: true, data: Work[] }
 */
router.get('/popular', workController.getPopularWorks);

/**
 * GET /api/works/:workId/similar
 * ------------------------------
 * Returns works similar to the specified work.
 * Similarity based on type and shared genres.
 * Useful for "You might also like" sections.
 *
 * @access  Public
 * @param   {string} workId - Work ID to find similar works for
 * @returns {Object} 200 - { success: true, data: Work[] } (limited to 10)
 * @returns {Object} 404 - Work not found
 */
router.get(
    '/:workId/similar',
    validateIdParam('workId'),
    workController.getSimilarWorks
);

export default router;
