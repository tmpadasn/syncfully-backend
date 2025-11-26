import Rating from '../models/Rating.js';
import { mockRatings, getNextRatingId } from '../data/mockRatings.js';
import { mockUsers } from '../data/mockUsers.js';
import { mockWorks } from '../data/mockWorks.js';
import { isMongoConnected } from '../config/database.js';
import { calculateAverageRating } from '../utils/helpers.js';

/**
 * Get rating by ID
 * @param {number|string} ratingId - Rating ID
 * @returns {Promise<Object|null>}
 */
export const getRatingById = async (ratingId) => {
    if (isMongoConnected()) {
        const rating = await Rating.findById(ratingId);
        if (!rating) return null;

        return rating.toJSON();
    }

    // Use mock data
    const rating = mockRatings.find(r => r.id === parseInt(ratingId));
    if (!rating) return null;

    return {
        ratingId: rating.id,
        userId: rating.userId,
        workId: rating.workId,
        score: rating.score,
        ratedAt: rating.ratedAt
    };
};

/**
 * Get all ratings for a work
 * @param {number|string} workId - Work ID
 * @returns {Promise<Array>}
 */
export const getWorkRatings = async (workId) => {
    if (isMongoConnected()) {
        const ratings = await Rating.find({ workId });

        return ratings.map(r => r.toJSON());
    }

    // Use mock data
    const ratings = mockRatings.filter(r => r.workId === parseInt(workId));

    return ratings.map(r => ({
        ratingId: r.id,
        userId: r.userId,
        workId: r.workId,
        score: r.score,
        ratedAt: r.ratedAt
    }));
};

/**
 * Create or update a rating
 * @param {number|string} userId - User ID
 * @param {number|string} workId - Work ID
 * @param {number} score - Rating score
 * @returns {Promise<Object>}
 */
export const createOrUpdateRating = async (userId, workId, score) => {
    if (isMongoConnected()) {
        // Check if user and work exist
        const User = (await import('../models/User.js')).default;
        const Work = (await import('../models/Work.js')).default;

        const user = await User.findById(userId);
        if (!user) throw new Error('User not found');

        const work = await Work.findById(workId);
        if (!work) throw new Error('Work not found');

        // Update or create rating
        const rating = await Rating.findOneAndUpdate(
            { userId, workId },
            { score, ratedAt: new Date() },
            { new: true, upsert: true, runValidators: true }
        );

        return rating.toJSON();
    }

    // Use mock data
    // Check if user exists
    const user = mockUsers.find(u => u.id === parseInt(userId));
    if (!user) throw new Error('User not found');

    // Check if work exists
    const work = mockWorks.find(w => w.id === parseInt(workId));
    if (!work) throw new Error('Work not found');

    // Find existing rating
    const existingRatingIndex = mockRatings.findIndex(
        r => r.userId === parseInt(userId) && r.workId === parseInt(workId)
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

        return {
            ratingId: mockRatings[existingRatingIndex].id,
            userId: parseInt(userId),
            workId: parseInt(workId),
            score,
            ratedAt: mockRatings[existingRatingIndex].ratedAt
        };
    }

    // Create new rating
    const newRating = {
        id: getNextRatingId(),
        userId: parseInt(userId),
        workId: parseInt(workId),
        score,
        ratedAt: new Date().toISOString()
    };

    mockRatings.push(newRating);

    // Update user's ratedWorks
    user.ratedWorks[workId] = {
        score,
        ratedAt: newRating.ratedAt
    };

    return {
        ratingId: newRating.id,
        userId: newRating.userId,
        workId: newRating.workId,
        score: newRating.score,
        ratedAt: newRating.ratedAt
    };
};

/**
 * Update a rating
 * @param {number|string} ratingId - Rating ID
 * @param {number} score - New rating score
 * @returns {Promise<Object|null>}
 */
export const updateRating = async (ratingId, score) => {
    if (isMongoConnected()) {
        const rating = await Rating.findByIdAndUpdate(
            ratingId,
            { score, ratedAt: new Date() },
            { new: true, runValidators: true }
        );

        if (!rating) return null;

        return rating.toJSON();
    }

    // Use mock data
    const ratingIndex = mockRatings.findIndex(r => r.id === parseInt(ratingId));
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

    return {
        ratingId: rating.id,
        userId: rating.userId,
        workId: rating.workId,
        score: score,  // Use the new score parameter instead of rating.score
        ratedAt: rating.ratedAt
    };
};

/**
 * Delete a rating
 * @param {number|string} ratingId - Rating ID
 * @returns {Promise<boolean>}
 */
export const deleteRating = async (ratingId) => {
    if (isMongoConnected()) {
        const result = await Rating.findByIdAndDelete(ratingId);
        return result !== null;
    }

    // Use mock data
    const ratingIndex = mockRatings.findIndex(r => r.id === parseInt(ratingId));
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
    if (isMongoConnected()) {
        const ratings = await Rating.find();
        return ratings.map(r => r.toJSON());
    }

    // Use mock data
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
    const ratings = await getWorkRatings(workId);

    if (ratings.length === 0) {
        return {
            workId: parseInt(workId),
            averageRating: 0,
            totalRatings: 0
        };
    }

    const average = calculateAverageRating(ratings);

    return {
        workId: parseInt(workId),
        averageRating: average,
        totalRatings: ratings.length
    };
};
