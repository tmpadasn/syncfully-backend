/**
 * =============================================================================
 * USER SOCIAL CONTROLLER
 * =============================================================================
 * 
 * Handles social features: follow/unfollow relationships between users.
 * Routes: /api/users/:userId/following and /api/users/:userId/followers
 * 
 * Dependencies:
 * - userService: Database operations for follow relationships
 * - responses: Standardized API response helpers
 * 
 * @module controllers/userSocialController
 */

import * as userService from '../services/userService.js';
import { sendSuccess, sendError } from '../utils/responses.js';
import { HTTP_STATUS } from '../config/constants.js';
import { catchAsync } from '../utils/catchAsync.js';

// =============================================================================
// FOLLOW LISTS
// =============================================================================

/**
 * Get users that a user is following
 * 
 * Returns list of users that the specified user follows.
 * Includes basic user info (id, username, profile picture) for each.
 * 
 * @route   GET /api/users/:userId/following
 * @access  Public
 * @param   {string} req.params.userId - User ID
 * @returns {Object} 200 - { following: [user objects] }
 * @returns {Object} 404 - User not found
 */
export const getUserFollowing = catchAsync(async (req, res) => {
    const { userId } = req.params;

    try {
        const following = await userService.getUserFollowing(userId);
        sendSuccess(res, HTTP_STATUS.OK, { following });
    } catch (error) {
        if (error.message === 'User not found') {
            return sendError(res, HTTP_STATUS.NOT_FOUND, error.message);
        }
        throw error;
    }
});

/**
 * Get users that follow a user
 * 
 * Returns list of users who follow the specified user.
 * Includes basic user info (id, username, profile picture) for each.
 * 
 * @route   GET /api/users/:userId/followers
 * @access  Public
 * @param   {string} req.params.userId - User ID
 * @returns {Object} 200 - { followers: [user objects] }
 * @returns {Object} 404 - User not found
 */
export const getUserFollowers = catchAsync(async (req, res) => {
    const { userId } = req.params;

    try {
        const followers = await userService.getUserFollowers(userId);
        sendSuccess(res, HTTP_STATUS.OK, { followers });
    } catch (error) {
        if (error.message === 'User not found') {
            return sendError(res, HTTP_STATUS.NOT_FOUND, error.message);
        }
        throw error;
    }
});

// =============================================================================
// FOLLOW ACTIONS
// =============================================================================

/**
 * Follow a user
 * 
 * Creates a follow relationship between two users.
 * Updates both users' following/followers lists bidirectionally.
 * 
 * Validations:
 * - Cannot follow yourself
 * - Cannot follow already-followed user
 * 
 * @route   POST /api/users/:userId/following/:targetUserId
 * @access  Public (should require auth in production)
 * @param   {string} req.params.userId - Follower's user ID
 * @param   {string} req.params.targetUserId - User ID to follow
 * @returns {Object} 200 - Updated relationship data
 * @returns {Object} 404 - User or target user not found
 * @returns {Object} 400 - Cannot follow self or already following
 */
export const followUser = catchAsync(async (req, res) => {
    const { userId, targetUserId } = req.params;

    try {
        const result = await userService.followUser(userId, targetUserId);
        sendSuccess(res, HTTP_STATUS.OK, result);
    } catch (error) {
        // Handle user not found
        if (error.message === 'User not found') {
            return sendError(res, HTTP_STATUS.NOT_FOUND, error.message);
        }
        // Handle business logic errors (self-follow, duplicate follow)
        if (error.message === 'Cannot follow yourself' || error.message === 'Already following this user') {
            return sendError(res, HTTP_STATUS.BAD_REQUEST, error.message);
        }
        throw error;
    }
});

/**
 * Unfollow a user
 * 
 * Removes a follow relationship between two users.
 * Updates both users' following/followers lists bidirectionally.
 * 
 * Validations:
 * - Must currently be following the target user
 * 
 * @route   DELETE /api/users/:userId/following/:targetUserId
 * @access  Public (should require auth in production)
 * @param   {string} req.params.userId - Follower's user ID
 * @param   {string} req.params.targetUserId - User ID to unfollow
 * @returns {Object} 200 - Updated relationship data
 * @returns {Object} 404 - User or target user not found
 * @returns {Object} 400 - Not currently following this user
 */
export const unfollowUser = catchAsync(async (req, res) => {
    const { userId, targetUserId } = req.params;

    try {
        const result = await userService.unfollowUser(userId, targetUserId);
        sendSuccess(res, HTTP_STATUS.OK, result);
    } catch (error) {
        // Handle user not found
        if (error.message === 'User not found') {
            return sendError(res, HTTP_STATUS.NOT_FOUND, error.message);
        }
        // Handle business logic error (not following)
        if (error.message === 'Not following this user') {
            return sendError(res, HTTP_STATUS.BAD_REQUEST, error.message);
        }
        throw error;
    }
});
