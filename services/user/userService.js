/**
 * @fileoverview User Service
 * @description Core user management operations including CRUD and authentication.
 *
 * This service handles all user-related business logic:
 * - User CRUD operations (create, read, update, delete)
 * - User authentication (login via email or username)
 * - Recommendation version management for cache invalidation
 *
 * Data Storage:
 * Currently uses in-memory mock data for development.
 * Designed for easy migration to MongoDB/Mongoose.
 *
 * Security Notes:
 * - Passwords are stored in plain text in mock data (NOT production-safe)
 * - Email format validation is performed on create/update
 * - Duplicate username/email prevention
 *
 * @module services/user/userService
 * @see controllers/userCrudController - CRUD HTTP endpoints
 * @see controllers/authController - Authentication endpoints
 */

import { mockUsers, getNextUserId } from '../../data/mockUsers.js';
import { isValidEmail } from '../../utils/validators.js';
import { buildImageUrl } from '../../utils/imageHelpers.js';
import { safeParseInt } from '../../utils/helpers.js';

// =============================================================================
// HELPER FUNCTIONS
// =============================================================================

/**
 * Finds a mock user by their ID.
 * Uses safeParseInt to handle string/number ID conversion.
 *
 * @param {number|string} userId - User ID to search for
 * @returns {Object|null} User object if found, null otherwise
 */
const findMockUserById = (userId) => {
  const parsedId = safeParseInt(userId, 'userId');
  return mockUsers.find(u => u.id === parsedId) || null;
};

// =============================================================================
// READ OPERATIONS
// =============================================================================

/**
 * Retrieves all users from the mock data.
 * Returns a lightweight list suitable for directory views.
 *
 * @async
 * @returns {Promise<Array>} Array of user summary objects
 */
export const getAllUsers = async () => {
  return mockUsers.map(user => ({
    userId: user.id,
    username: user.username,
    email: user.email,
    profilePictureUrl: user.profilePictureUrl,
    ratedWorks: Object.keys(user.ratedWorks).length  // Count only, not data
  }));
};

/**
 * Get user by ID
 * @param {number|string} userId - User ID
 * @returns {Promise<Object|null>}
 */
export const getUserById = async (userId) => {
  const user = findMockUserById(userId);
  if (!user) return null;

  return {
    userId: user.id,
    username: user.username,
    email: user.email,
    profilePictureUrl: buildImageUrl(user.profilePictureUrl, 'profile'),
    ratedWorks: Object.keys(user.ratedWorks).length
  };
};

/**
 * Create new user
 * @param {Object} userData - User data
 * @returns {Promise<Object>}
 */
export const createUser = async (userData) => {
  const { username, email, password, profilePictureUrl } = userData;

  // Validate email format
  if (!isValidEmail(email)) {
    throw new Error('Invalid email format');
  }

  // Check if user exists
  const existingUser = mockUsers.find(u => u.email === email || u.username === username);
  if (existingUser) {
    if (existingUser.email === email) {
      throw new Error('Email already exists');
    }
    if (existingUser.username === username) {
      throw new Error('Username already exists');
    }
  }

  const newUser = {
    id: getNextUserId(),
    username,
    email,
    password,
    profilePictureUrl: profilePictureUrl || "http://localhost:3000/uploads/profiles/profile_picture.jpg",
    ratedWorks: {},
    recommendationVersion: Date.now()
  };

  mockUsers.push(newUser);

  return {
    userId: newUser.id,
    username: newUser.username,
    email: newUser.email,
    profilePictureUrl: newUser.profilePictureUrl,
    ratedWorks: 0
  };
};

/**
 * Update user
 * @param {number|string} userId - User ID
 * @param {Object} updateData - Data to update
 * @returns {Promise<Object|null>}
 */
export const updateUser = async (userId, updateData) => {
  const { username, email, password, profilePictureUrl } = updateData;

  if (email && !isValidEmail(email)) {
    throw new Error('Invalid email format');
  }

  const parsedId = safeParseInt(userId, 'userId');
  const userIndex = mockUsers.findIndex(u => u.id === parsedId);
  if (userIndex === -1) return null;

  // Check for duplicate username/email
  if (username || email) {
    const existingUser = mockUsers.find(u =>
      u.id !== parsedId &&
      (u.username === username || u.email === email)
    );

    if (existingUser) {
      if (existingUser.username === username) {
        throw new Error('Username already exists');
      }
      if (existingUser.email === email) {
        throw new Error('Email already exists');
      }
    }
  }

  if (username) mockUsers[userIndex].username = username;
  if (email) mockUsers[userIndex].email = email;
  if (password) mockUsers[userIndex].password = password;
  if (profilePictureUrl !== undefined) mockUsers[userIndex].profilePictureUrl = profilePictureUrl;

  return {
    userId: mockUsers[userIndex].id,
    username: mockUsers[userIndex].username,
    email: mockUsers[userIndex].email,
    profilePictureUrl: mockUsers[userIndex].profilePictureUrl,
    ratedWorks: Object.keys(mockUsers[userIndex].ratedWorks).length
  };
};

/**
 * Delete user
 * @param {number|string} userId - User ID
 * @returns {Promise<boolean>}
 */
export const deleteUser = async (userId) => {
  const parsedId = safeParseInt(userId, 'userId');
  const userIndex = mockUsers.findIndex(u => u.id === parsedId);
  if (userIndex === -1) return false;

  mockUsers.splice(userIndex, 1);
  return true;
};

/**
 * Authenticate user using mock data (email or username + plain password)
 * @param {string} identifier - email OR username
 * @param {string} password - plain text password
 * @returns {Promise<Object>}
 */
export const authenticateUser = async (identifier, password) => {
  const ident = (identifier || '').toLowerCase();

  const user = mockUsers.find(
    (u) =>
      u.email.toLowerCase() === ident ||
      u.username.toLowerCase() === ident
  );

  if (!user) {
    throw new Error('User not found');
  }

  if (user.password !== password) {
    throw new Error('Invalid credentials');
  }

  return {
    userId: user.id,
    username: user.username,
    email: user.email,
    profilePictureUrl: buildImageUrl(user.profilePictureUrl, 'profile'),
    ratedWorks: Object.keys(user.ratedWorks).length
  };
};

/**
 * Get recommendation version for a user
 * @param {number|string} userId - User ID
 * @returns {Promise<number>}
 */
export const getRecommendationVersion = async (userId) => {
  const user = findMockUserById(userId);
  if (!user) return Date.now();
  return user.recommendationVersion || Date.now();
};

/**
 * Update recommendation version for a user (triggers new recommendations)
 * @param {number|string} userId - User ID
 * @returns {Promise<number>}
 */
export const updateRecommendationVersion = async (userId) => {
  const newVersion = Date.now();
  const user = findMockUserById(userId);
  if (user) {
    user.recommendationVersion = newVersion;
  }
  return newVersion;
};
