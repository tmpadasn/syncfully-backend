/**
 * @fileoverview User Follow Service
 * @description Handles social follow/unfollow operations between users.
 *
 * This service manages the bidirectional follow relationships between users.
 * When user A follows user B:
 * - User A's 'following' array includes user B's ID
 * - User B's 'followers' array includes user A's ID
 *
 * Both arrays are kept in sync during follow/unfollow operations.
 *
 * Business Rules:
 * - Users cannot follow themselves
 * - Duplicate follows are prevented
 * - Unfollowing requires an existing follow relationship
 *
 * @module services/user/userFollowService
 * @see controllers/userSocialController - HTTP endpoint handler
 */

import { mockUsers } from '../../data/mockUsers.js';

// =============================================================================
// FOLLOW LIST QUERIES
// =============================================================================

/**
 * Retrieves the list of users that a specific user is following.
 *
 * @async
 * @param {number|string} userId - ID of the user whose following list to fetch
 * @returns {Promise<Array>} Array of user objects being followed
 * @throws {Error} If the user is not found
 *
 * @example
 * const following = await getUserFollowing(1);
 * // Returns: [{ userId: 2, username: 'bob', ... }, ...]
 */
export const getUserFollowing = async (userId) => {
  // Find the user in mock data
  const user = mockUsers.find(u => u.id === parseInt(userId));
  if (!user) {
    throw new Error('User not found');
  }

  // Return empty array if user has no following list
  if (!user.following || user.following.length === 0) {
    return [];
  }

  // Map following IDs to full user objects, filtering out any invalid references
  return user.following.map(followedUserId => {
    const followedUser = mockUsers.find(u => u.id === followedUserId);
    if (followedUser) {
      return {
        userId: followedUser.id,
        username: followedUser.username,
        email: followedUser.email,
        profilePictureUrl: followedUser.profilePictureUrl,
        createdAt: followedUser.createdAt || new Date().toISOString()
      };
    }
  }).filter(Boolean);  // Remove undefined entries
};

/**
 * Get users that follow a user
 * @param {number|string} userId - User ID
 * @returns {Promise<Array>}
 * @throws {Error} if user not found
 */
export const getUserFollowers = async (userId) => {
  const user = mockUsers.find(u => u.id === parseInt(userId));
  if (!user) {
    throw new Error('User not found');
  }

  if (!user.followers || user.followers.length === 0) {
    return [];
  }

  return user.followers.map(followerUserId => {
    const followerUser = mockUsers.find(u => u.id === followerUserId);
    if (followerUser) {
      return {
        userId: followerUser.id,
        username: followerUser.username,
        email: followerUser.email,
        profilePictureUrl: followerUser.profilePictureUrl,
        createdAt: followerUser.createdAt || new Date().toISOString()
      };
    }
  }).filter(Boolean);
};

/**
 * Follow a user
 * @param {number|string} userId - User ID of the follower
 * @param {number|string} targetUserId - User ID to follow
 * @returns {Promise<Object>}
 * @throws {Error} if user not found, target not found, already following, or trying to follow self
 */
export const followUser = async (userId, targetUserId) => {
  if (userId === targetUserId || userId == targetUserId) {
    throw new Error('Cannot follow yourself');
  }

  const userIndex = mockUsers.findIndex(u => u.id === parseInt(userId));
  const targetUserIndex = mockUsers.findIndex(u => u.id === parseInt(targetUserId));

  if (userIndex === -1) {
    throw new Error('User not found');
  }
  if (targetUserIndex === -1) {
    throw new Error('Target user not found');
  }

  if (!mockUsers[userIndex].following) {
    mockUsers[userIndex].following = [];
  }
  if (!mockUsers[targetUserIndex].followers) {
    mockUsers[targetUserIndex].followers = [];
  }

  if (mockUsers[userIndex].following.includes(parseInt(targetUserId))) {
    throw new Error('Already following this user');
  }

  mockUsers[userIndex].following.push(parseInt(targetUserId));
  mockUsers[targetUserIndex].followers.push(parseInt(userId));

  return {
    userId: mockUsers[userIndex].id,
    username: mockUsers[userIndex].username,
    email: mockUsers[userIndex].email,
    createdAt: mockUsers[userIndex].createdAt || new Date().toISOString()
  };
};

/**
 * Unfollow a user
 * @param {number|string} userId - User ID of the follower
 * @param {number|string} targetUserId - User ID to unfollow
 * @returns {Promise<Object>}
 * @throws {Error} if user not found, target not found, or not following
 */
export const unfollowUser = async (userId, targetUserId) => {
  const userIndex = mockUsers.findIndex(u => u.id === parseInt(userId));
  const targetUserIndex = mockUsers.findIndex(u => u.id === parseInt(targetUserId));

  if (userIndex === -1) {
    throw new Error('User not found');
  }
  if (targetUserIndex === -1) {
    throw new Error('Target user not found');
  }

  if (!mockUsers[userIndex].following || !mockUsers[userIndex].following.includes(parseInt(targetUserId))) {
    throw new Error('Not following this user');
  }

  mockUsers[userIndex].following = mockUsers[userIndex].following.filter(id => id !== parseInt(targetUserId));
  mockUsers[targetUserIndex].followers = mockUsers[targetUserIndex].followers.filter(id => id !== parseInt(userId));

  return {
    userId: mockUsers[userIndex].id,
    username: mockUsers[userIndex].username,
    email: mockUsers[userIndex].email,
    createdAt: mockUsers[userIndex].createdAt || new Date().toISOString()
  };
};
