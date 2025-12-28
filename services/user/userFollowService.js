import { mockUsers } from '../../data/mockUsers.js';

/**
 * Get users that a user is following
 * @param {number|string} userId - User ID
 * @returns {Promise<Array>}
 * @throws {Error} if user not found
 */
export const getUserFollowing = async (userId) => {
  const user = mockUsers.find(u => u.id === parseInt(userId));
  if (!user) {
    throw new Error('User not found');
  }

  if (!user.following || user.following.length === 0) {
    return [];
  }

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
  }).filter(Boolean);
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
