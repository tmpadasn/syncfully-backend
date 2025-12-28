/**
 * API Routes Index
 *
 * Main router that aggregates all route modules.
 * All routes are mounted under /api prefix in app.js
 *
 * Route Structure:
 * - /api/auth - Authentication (login, signup)
 * - /api/users - User management and social features
 * - /api/works - Media works (CRUD, discovery)
 * - /api/ratings - Rating management
 * - /api/search - Cross-resource search
 * - /api/shelves - User collections
 */

import express from 'express';
import userRoutes from './userRoutes.js';
import workRoutes from './workRoutes.js';
import ratingRoutes from './ratingRoutes.js';
import searchRoutes from './searchRoutes.js';
import authRoutes from './authRoutes.js';
import shelfRoutes from './shelfRoutes.js';

const router = express.Router();

/**
 * Authentication Routes
 *
 * Handles user login and registration.
 * Mounted first for logical grouping.
 */
router.use('/auth', authRoutes);

/**
 * Resource Routes
 *
 * Core CRUD operations for each resource type.
 * Order doesn't affect functionality.
 */
router.use('/users', userRoutes);
router.use('/works', workRoutes);
router.use('/ratings', ratingRoutes);
router.use('/search', searchRoutes);
router.use('/shelves', shelfRoutes);

export default router;
