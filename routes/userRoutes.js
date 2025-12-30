/**
 * User Routes
 *
 * Handles user management, social features, and user-specific data.
 * Includes CRUD operations, ratings, recommendations, follows, and shelves.
 * Base path: /api/users
 */

import express from 'express';
import * as userCrudController from '../controllers/userCrudController.js';
import * as userRatingsController from '../controllers/userRatingsController.js';
import * as userSocialController from '../controllers/userSocialController.js';
import * as shelfController from '../controllers/shelfController.js';
import { validateRequiredFields, validateIdParam } from '../middleware/validation.js';

const router = express.Router();

// ============================================================================
// User CRUD Operations
// ============================================================================

/**
 * Get All Users
 *
 * Returns list of all users in the system.
 * Excludes sensitive data (passwords).
 *
 * @route   GET /api/users
 * @access  Public
 * @returns {Array} 200 - Array of user objects
 */
router.get('/', userCrudController.getAllUsers);

/**
 * Create User
 *
 * Registers a new user account.
 * Validates username/email uniqueness and password strength.
 * Alternative: Use /api/auth/signup for authentication context.
 *
 * @route   POST /api/users
 * @access  Public
 * @body    {string} username - Unique username (3-20 chars)
 * @body    {string} email - Valid email address
 * @body    {string} password - Password (min 6 chars)
 * @body    {string} [profilePictureUrl] - Optional profile picture path
 * @returns {Object} 201 - Created user object
 * @returns {Object} 400 - Validation errors or duplicate username/email
 */
router.post(
    '/',
    validateRequiredFields(['username', 'email', 'password']),
    userCrudController.createUser
);

/**
 * Get User By ID
 *
 * Retrieves detailed information for a specific user.
 * Includes profile data and rated works count.
 *
 * @route   GET /api/users/:userId
 * @access  Public
 * @param   {string} userId - User ID (positive integer)
 * @returns {Object} 200 - User object
 * @returns {Object} 404 - User not found
 * @returns {Object} 400 - Invalid user ID
 */
router.get(
    '/:userId',
    validateIdParam('userId'),
    userCrudController.getUserById
);

/**
 * Update User
 *
 * Modifies user account information.
 * All fields are optional - only updates provided fields.
 *
 * @route   PUT /api/users/:userId
 * @access  Public (should check ownership in production)
 * @param   {string} userId - User ID
 * @body    {string} [username] - New username (must be unique)
 * @body    {string} [email] - New email (must be unique)
 * @body    {string} [password] - New password (min 6 chars)
 * @body    {string} [profilePictureUrl] - New profile picture path
 * @returns {Object} 200 - Updated user object
 * @returns {Object} 404 - User not found
 * @returns {Object} 400 - Validation errors or duplicate username/email
 */
router.put(
    '/:userId',
    validateIdParam('userId'),
    userCrudController.updateUser
);

/**
 * Delete User
 *
 * Removes user account from the system.
 * Should also cascade delete ratings, shelves, and follows.
 *
 * @route   DELETE /api/users/:userId
 * @access  Public (should check ownership in production)
 * @param   {string} userId - User ID
 * @returns {Object} 204 - No content (success)
 * @returns {Object} 404 - User not found
 */
router.delete(
    '/:userId',
    validateIdParam('userId'),
    userCrudController.deleteUser
);

// ============================================================================
// User Ratings
// ============================================================================

/**
 * Get User Ratings
 *
 * Returns all works rated by the user.
 * Returns object mapping workId to rating data.
 *
 * @route   GET /api/users/:userId/ratings
 * @access  Public
 * @param   {string} userId - User ID
 * @returns {Object} 200 - { workId: { score, ratedAt }, ... }
 * @returns {Object} 404 - User not found
 */
router.get(
    '/:userId/ratings',
    validateIdParam('userId'),
    userRatingsController.getUserRatings
);

/**
 * Add/Update User Rating
 *
 * Creates new rating or updates existing one.
 * Updates user's recommendationVersion for cache invalidation.
 *
 * @route   POST /api/users/:userId/ratings
 * @access  Public (should check ownership in production)
 * @param   {string} userId - User ID
 * @body    {number} workId - Work ID to rate
 * @body    {number} score - Rating score (1-5, integer)
 * @returns {Object} 200 - Rating object with ratedAt timestamp
 * @returns {Object} 404 - User not found
 * @returns {Object} 400 - Invalid workId or score
 */
router.post(
    '/:userId/ratings',
    validateIdParam('userId'),
    validateRequiredFields(['workId', 'score']),
    userRatingsController.addUserRating
);

// ============================================================================
// User Recommendations
// ============================================================================

/**
 * Get User Recommendations
 *
 * Returns personalized work recommendations based on user's ratings.
 * Uses collaborative filtering and content-based algorithms.
 *
 * @route   GET /api/users/:userId/recommendations
 * @access  Public
 * @param   {string} userId - User ID
 * @returns {Array} 200 - Array of recommended works with scores
 * @returns {Object} 404 - User not found
 */
router.get(
    '/:userId/recommendations',
    validateIdParam('userId'),
    userRatingsController.getUserRecommendations
);

// ============================================================================
// User Shelves (nested resource)
// ============================================================================

/**
 * Get User Shelves
 *
 * Returns all shelves (collections) created by the user.
 * Alternative: Use /api/shelves with filtering.
 *
 * @route   GET /api/users/:userId/shelves
 * @access  Public
 * @param   {string} userId - User ID
 * @returns {Array} 200 - Array of shelf objects
 * @returns {Object} 404 - User not found (returns empty array)
 */
router.get(
    '/:userId/shelves',
    validateIdParam('userId'),
    shelfController.getUserShelves
);

/**
 * Create User Shelf
 *
 * Creates new collection for organizing works.
 * Shelf name must be unique per user.
 *
 * @route   POST /api/users/:userId/shelves
 * @access  Public (should check ownership in production)
 * @param   {string} userId - User ID
 * @body    {string} name - Shelf name (1-50 chars, unique per user)
 * @body    {string} [description] - Optional description (max 500 chars)
 * @returns {Object} 200 - Created shelf object
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
// Social Features (Follow/Unfollow)
// ============================================================================

/**
 * Get Following List
 *
 * Returns users that this user follows.
 * Includes basic user info for each followed user.
 *
 * @route   GET /api/users/:userId/following
 * @access  Public
 * @param   {string} userId - User ID
 * @returns {Array} 200 - Array of user objects
 * @returns {Object} 404 - User not found
 */
router.get('/:userId/following', userSocialController.getUserFollowing);

/**
 * Get Followers List
 *
 * Returns users who follow this user.
 * Includes basic user info for each follower.
 *
 * @route   GET /api/users/:userId/followers
 * @access  Public
 * @param   {string} userId - User ID
 * @returns {Array} 200 - Array of user objects
 * @returns {Object} 404 - User not found
 */
router.get('/:userId/followers', userSocialController.getUserFollowers);

/**
 * Follow User
 *
 * Creates bidirectional follow relationship.
 * Adds targetUser to userId's following list.
 * Adds userId to targetUser's followers list.
 *
 * @route   POST /api/users/:userId/following/:targetUserId
 * @access  Public (should check ownership in production)
 * @param   {string} userId - Follower's user ID
 * @param   {string} targetUserId - User ID to follow
 * @returns {Object} 200 - Updated user object
 * @returns {Object} 404 - User or target user not found
 * @returns {Object} 400 - Cannot follow self or already following
 */
router.post('/:userId/following/:targetUserId', userSocialController.followUser);

/**
 * Unfollow User
 *
 * Removes bidirectional follow relationship.
 * Removes targetUser from userId's following list.
 * Removes userId from targetUser's followers list.
 *
 * @route   DELETE /api/users/:userId/following/:targetUserId
 * @access  Public (should check ownership in production)
 * @param   {string} userId - Follower's user ID
 * @param   {string} targetUserId - User ID to unfollow
 * @returns {Object} 200 - Updated user object
 * @returns {Object} 404 - User or target user not found
 * @returns {Object} 400 - Not currently following this user
 */
router.delete('/:userId/following/:targetUserId', userSocialController.unfollowUser);

export default router;
