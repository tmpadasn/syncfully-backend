import { mockRatings, getNextRatingId } from '../data/mockRatings.js';
import { mockUsers } from '../data/mockUsers.js';
import { mockWorks } from '../data/mockWorks.js';
import { calculateAverageRating, safeParseInt } from '../utils/helpers.js';
import { updateRecommendationVersion } from './userService.js';

/**
 * Helper: Find mock rating by ID
 * @param {number|string} ratingId - Rating ID
 * @returns {Object|null} Rating object or null
 */
const findMockRatingById = (ratingId) => {
    const parsedId = safeParseInt(ratingId, 'ratingId');
    return mockRatings.find(r => r.id === parsedId) || null;
};

/**
 * Helper: Format rating data for response
 * @param {Object} rating - Rating object from mock data
 * @returns {Object} Formatted rating data
 */
const formatRatingData = (rating) => {
    return {
        ratingId: rating.id,
        userId: rating.userId,
        workId: rating.workId,
        score: rating.score,
        ratedAt: rating.ratedAt
    };
};

/**
 * Get rating by ID
 * @param {number|string} ratingId - Rating ID
 * @returns {Promise<Object|null>}
 */
export const getRatingById = async (ratingId) => {
    const rating = findMockRatingById(ratingId);
    if (!rating) return null;
    return formatRatingData(rating);
};

/**
 * Get all ratings for a work
 * @param {number|string} workId - Work ID
 * @returns {Promise<Array>}
 */
export const getWorkRatings = async (workId) => {
    const parsedWorkId = safeParseInt(workId, 'workId');
    const ratings = mockRatings.filter(r => r.workId === parsedWorkId);
    return ratings.map(formatRatingData);
};

/**
 * Create or update a rating
 * @param {number|string} userId - User ID
 * @param {number|string} workId - Work ID
 * @param {number} score - Rating score
 * @returns {Promise<Object>}
 */
export const createOrUpdateRating = async (userId, workId, score) => {
    const parsedUserId = safeParseInt(userId, 'userId');
    const parsedWorkId = safeParseInt(workId, 'workId');

    // Check if user exists
    const user = mockUsers.find(u => u.id === parsedUserId);
    if (!user) throw new Error('User not found');

    // Check if work exists
    const work = mockWorks.find(w => w.id === parsedWorkId);
    if (!work) throw new Error('Work not found');

    // Find existing rating
    const existingRatingIndex = mockRatings.findIndex(
        r => r.userId === parsedUserId && r.workId === parsedWorkId
    );

    if (existingRatingIndex !== -1) {
        // Update existing rating
        mockRatings[existingRatingIndex].score = score;
        mockRatings[existingRatingIndex].ratedAt = new Date().toISOString();

        // Update user's ratedWorks
        user.ratedWorks[workId] = {
            score,
            ratedAt: mockRatings[existingRatingIndex].ratedAt
        };

        await updateRecommendationVersion(userId);
        return formatRatingData(mockRatings[existingRatingIndex]);
    }

    // Create new rating
    const newRating = {
        id: getNextRatingId(),
        userId: parsedUserId,
        workId: parsedWorkId,
        score,
        ratedAt: new Date().toISOString()
    };

    mockRatings.push(newRating);

    // Update user's ratedWorks
    user.ratedWorks[workId] = {
        score,
        ratedAt: newRating.ratedAt
    };

    await updateRecommendationVersion(userId);
    return formatRatingData(newRating);
};

/**
 * Update a rating
 * @param {number|string} ratingId - Rating ID
 * @param {number} score - New rating score
 * @returns {Promise<Object|null>}
 */
export const updateRating = async (ratingId, score) => {
    const parsedRatingId = safeParseInt(ratingId, 'ratingId');
    const ratingIndex = mockRatings.findIndex(r => r.id === parsedRatingId);
    if (ratingIndex === -1) return null;

    mockRatings[ratingIndex].score = score;
    mockRatings[ratingIndex].ratedAt = new Date().toISOString();

    // Update user's ratedWorks
    const rating = mockRatings[ratingIndex];
    const user = mockUsers.find(u => u.id === rating.userId);
    if (user) {
        user.ratedWorks[rating.workId] = {
            score,
            ratedAt: rating.ratedAt
        };
    }

    await updateRecommendationVersion(rating.userId);
    return formatRatingData({ ...rating, score });
};

/**
 * Delete a rating
 * @param {number|string} ratingId - Rating ID
 * @returns {Promise<boolean>}
 */
export const deleteRating = async (ratingId) => {
    const parsedRatingId = safeParseInt(ratingId, 'ratingId');
    const ratingIndex = mockRatings.findIndex(r => r.id === parsedRatingId);
    if (ratingIndex === -1) return false;

    // Remove from user's ratedWorks
    const rating = mockRatings[ratingIndex];
    const user = mockUsers.find(u => u.id === rating.userId);
    if (user && user.ratedWorks[rating.workId]) {
        delete user.ratedWorks[rating.workId];
    }

    mockRatings.splice(ratingIndex, 1);
    return true;
};

/**
 * Get all ratings (for admin purposes)
 * @returns {Promise<Array>}
 */
export const getAllRatings = async () => {
    return mockRatings.map(r => ({
        ratingId: r.id,
        userId: r.userId,
        workId: r.workId,
        score: r.score,
        ratedAt: r.ratedAt
    }));
};

/**
 * Get average rating for a work
 * @param {number|string} workId - Work ID
 * @returns {Promise<Object>}
 */
export const getWorkAverageRating = async (workId) => {
    const parsedWorkId = safeParseInt(workId, 'workId');
    const ratings = await getWorkRatings(workId);

    if (ratings.length === 0) {
        return {
            workId: parsedWorkId,
            averageRating: 0,
            totalRatings: 0
        };
    }

    const average = calculateAverageRating(ratings);

    return {
        workId: parsedWorkId,
        averageRating: average,
        totalRatings: ratings.length
    };
};
