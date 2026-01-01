/**
 * @fileoverview User Rating Service
 * @description Handles user-specific rating operations.
 *
 * This service manages the user-side of rating operations:
 * - Retrieving a user's ratings (what works they've rated)
 * - Adding/updating a user's rating for a work
 *
 * Data Structure:
 * User ratings are stored in two locations for different access patterns:
 * - user.ratedWorks: Map for quick "has user rated this work?" lookups
 * - mockRatings: Array for aggregation/average calculations
 *
 * Side Effects:
 * Adding a rating triggers recommendation version update for cache invalidation.
 *
 * @module services/user/userRatingService
 * @see controllers/userRatingsController - HTTP endpoint handler
 */

import { mockUsers } from '../../data/mockUsers.js';
import { safeParseInt } from '../../utils/helpers.js';
import { updateRecommendationVersion } from './userService.js';

// =============================================================================
// HELPER FUNCTIONS
// =============================================================================

/**
 * Finds a mock user by their ID.
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
 * Get user's ratings
 * @param {number|string} userId - User ID
 * @returns {Promise<Object|null>}
 */
export const getUserRatings = async (userId) => {
  const user = findMockUserById(userId);
  if (!user) return null;
  return user.ratedWorks;
};

/**
 * Add or update user rating for a work
 * @param {number|string} userId - User ID
 * @param {number} workId - Work ID
 * @param {number} score - Rating score
 * @returns {Promise<Object|null>}
 */
export const addUserRating = async (userId, workId, score) => {
  const user = findMockUserById(userId);
  if (!user) return null;

  user.ratedWorks[workId] = {
    score,
    ratedAt: new Date().toISOString()
  };

  // Update recommendation version to trigger new recommendations
  await updateRecommendationVersion(userId);

  return {
    userId: user.id,
    workId,
    score,
    ratedAt: new Date().toISOString()
  };
};
