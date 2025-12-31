/**
 * User Social Routes
 * ==================
 *
 * Social features (follow/unfollow) and user shelves (collections).
 *
 * Base path: /api/users
 *
 * ─────────────────────────────────────────────────────────────────────────────
 * ENDPOINTS (6)
 * ─────────────────────────────────────────────────────────────────────────────
 *
 * SHELVES (2 endpoints)
 *   GET    /:userId/shelves    - Get user's shelves
 *   POST   /:userId/shelves    - Create new shelf
 *
 * SOCIAL (4 endpoints)
 *   GET    /:userId/following              - Get following list
 *   GET    /:userId/followers              - Get followers list
 *   POST   /:userId/following/:targetUserId - Follow user
 *   DELETE /:userId/following/:targetUserId - Unfollow user
 *
 * @module routes/userSocialRoutes
 * @see routes/userCrudRoutes   - User CRUD operations
 * @see routes/userRatingRoutes - User ratings
 * @see routes/shelfRoutes      - Direct shelf management
 */

import express from 'express';
import * as userSocialController from '../controllers/userSocialController.js';
import * as shelfController from '../controllers/shelfController.js';
import { validateRequiredFields, validateIdParam } from '../middleware/validation.js';

const router = express.Router();

// ============================================================================
// USER SHELVES
// ============================================================================

/**
 * GET /api/users/:userId/shelves
 * ------------------------------
 * Returns all shelves (collections) created by the user.
 *
 * Alternative: Use GET /api/shelves with filtering.
 *
 * @access  Public
 * @param   {string} userId - User ID
 * @returns {Object} 200 - { success: true, data: Shelf[] }
 * @returns {Object} 404 - User not found (returns empty array)
 */
router.get(
    '/:userId/shelves',
    validateIdParam('userId'),
    shelfController.getUserShelves
);

/**
 * POST /api/users/:userId/shelves
 * -------------------------------
 * Creates new collection for organizing works.
 * Shelf name must be unique per user.
 *
 * @access  Public (should check ownership in production)
 * @param   {string} userId - User ID
 * @body    {string} name - Shelf name (1-50 chars, unique per user)
 * @body    {string} [description] - Optional description (max 500 chars)
 * @returns {Object} 200 - { success: true, data: Shelf }
 * @returns {Object} 404 - User not found
 * @returns {Object} 400 - Invalid name or duplicate shelf name
 */
router.post(
    '/:userId/shelves',
    validateIdParam('userId'),
    validateRequiredFields(['name']),
    shelfController.createShelf
);

// ============================================================================
// SOCIAL FEATURES (Follow/Unfollow)
// ============================================================================

/**
 * GET /api/users/:userId/following
 * --------------------------------
 * Returns users that this user follows.
 *
 * @access  Public
 * @param   {string} userId - User ID
 * @returns {Object} 200 - { success: true, data: User[] }
 * @returns {Object} 404 - User not found
 */
router.get('/:userId/following', userSocialController.getUserFollowing);

/**
 * GET /api/users/:userId/followers
 * --------------------------------
 * Returns users who follow this user.
 *
 * @access  Public
 * @param   {string} userId - User ID
 * @returns {Object} 200 - { success: true, data: User[] }
 * @returns {Object} 404 - User not found
 */
router.get('/:userId/followers', userSocialController.getUserFollowers);

/**
 * POST /api/users/:userId/following/:targetUserId
 * ------------------------------------------------
 * Creates bidirectional follow relationship.
 *   - Adds targetUser to userId's following list
 *   - Adds userId to targetUser's followers list
 *
 * @access  Public (should check ownership in production)
 * @param   {string} userId       - Follower's user ID
 * @param   {string} targetUserId - User ID to follow
 * @returns {Object} 200 - { success: true, data: User }
 * @returns {Object} 404 - User or target user not found
 * @returns {Object} 400 - Cannot follow self or already following
 */
router.post('/:userId/following/:targetUserId', userSocialController.followUser);

/**
 * DELETE /api/users/:userId/following/:targetUserId
 * --------------------------------------------------
 * Removes bidirectional follow relationship.
 *
 * @access  Public (should check ownership in production)
 * @param   {string} userId       - Follower's user ID
 * @param   {string} targetUserId - User ID to unfollow
 * @returns {Object} 200 - { success: true, data: User }
 * @returns {Object} 404 - User or target user not found
 * @returns {Object} 400 - Not currently following this user
 */
router.delete('/:userId/following/:targetUserId', userSocialController.unfollowUser);

export default router;
