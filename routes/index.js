/**
 * API Routes Index
 * =================
 *
 * Main router that aggregates all route modules.
 * All routes are mounted under /api prefix in app.js
 *
 * ─────────────────────────────────────────────────────────────────────────────
 * ROUTE STRUCTURE
 * ─────────────────────────────────────────────────────────────────────────────
 *
 * /api/auth      - Authentication (login, signup)
 *
 * /api/users     - User management (split into 3 modules)
 *   ├── userCrudRoutes   - CRUD operations
 *   ├── userRatingRoutes - Ratings & recommendations
 *   └── userSocialRoutes - Social features & shelves
 *
 * /api/works     - Media works (split into 3 modules)
 *   ├── workCrudRoutes      - CRUD operations
 *   ├── workDiscoveryRoutes - Popular & similar (mounted FIRST for /popular)
 *   └── workRatingRoutes    - Work ratings
 *
 * /api/ratings   - Direct rating management
 * /api/search    - Cross-resource search
 * /api/shelves   - Direct shelf management
 *
 * @module routes/index
 */

import express from 'express';

// Auth routes
import authRoutes from './authRoutes.js';

// User routes (split into 3 modules)
import userCrudRoutes from './userCrudRoutes.js';
import userRatingRoutes from './userRatingRoutes.js';
import userSocialRoutes from './userSocialRoutes.js';

// Work routes (split into 3 modules)
import workCrudRoutes from './workCrudRoutes.js';
import workDiscoveryRoutes from './workDiscoveryRoutes.js';
import workRatingRoutes from './workRatingRoutes.js';

// Other routes
import ratingRoutes from './ratingRoutes.js';
import searchRoutes from './searchRoutes.js';
import shelfRoutes from './shelfRoutes.js';

const router = express.Router();

// ============================================================================
// AUTHENTICATION
// ============================================================================

router.use('/auth', authRoutes);

// ============================================================================
// USER ROUTES
// ============================================================================
// Order matters: more specific routes should come first if they overlap.
// All 3 modules are mounted under /users.

router.use('/users', userCrudRoutes);
router.use('/users', userRatingRoutes);
router.use('/users', userSocialRoutes);

// ============================================================================
// WORK ROUTES
// ============================================================================
// Discovery routes MUST come before CRUD routes to avoid /:workId matching "popular".

router.use('/works', workDiscoveryRoutes);  // /popular must be before /:workId
router.use('/works', workCrudRoutes);
router.use('/works', workRatingRoutes);

// ============================================================================
// OTHER ROUTES
// ============================================================================

router.use('/ratings', ratingRoutes);
router.use('/search', searchRoutes);
router.use('/shelves', shelfRoutes);

export default router;
