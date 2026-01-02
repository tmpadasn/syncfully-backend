import { mockUsers } from '../../data/mockUsers.js';
import { safeParseInt } from '../../utils/helpers.js';
import { updateRecommendationVersion } from './userService.js';

/**
 * Helper: Find mock user by ID
 * @param {number|string} userId - User ID
 * @returns {Object|null} User object or null
 */
const findMockUserById = (userId) => {
  const parsedId = safeParseInt(userId, 'userId');
  return mockUsers.find(u => u.id === parsedId) || null;
};

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
