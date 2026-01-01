/**
 * @fileoverview Response Formatters
 * @description Utility functions to format mock data for API responses.
 *
 * These formatters provide consistent data transformation across the application.
 * They handle:
 * - Renaming internal ID fields to API-friendly names (id -> userId, workId, etc.)
 * - Computing derived fields (e.g., ratedWorks count)
 * - Selecting only public-facing fields (excluding passwords, internal state)
 *
 * Naming Convention:
 * - format{Entity}Response - Transforms entity for HTTP response
 *
 * @module services/common/formatters
 * @see services/*Service - Business logic that uses these formatters
 */

// =============================================================================
// USER FORMATTERS
// =============================================================================

/**
 * Formats a user object for API response.
 * Excludes sensitive data like passwords.
 *
 * @param {Object} user - User object from mock data
 * @returns {Object} Formatted user with safe public fields
 */
export const formatUserResponse = (user) => {
    return {
        userId: user.id,
        username: user.username,
        email: user.email,
        profilePictureUrl: user.profilePictureUrl,
        ratedWorks: Object.keys(user.ratedWorks || {}).length  // Count, not data
    };
};

// =============================================================================
// RATING FORMATTERS
// =============================================================================

/**
 * Format rating data for API response
 * @param {Object} rating - Rating object from mock data
 * @returns {Object} Formatted rating data
 */
export const formatRatingResponse = (rating) => {
    return {
        ratingId: rating.id,
        userId: rating.userId,
        workId: rating.workId,
        score: rating.score,
        ratedAt: rating.ratedAt
    };
};

/**
 * Format shelf data for API response
 * @param {Object} shelf - Shelf object from mock data
 * @returns {Object} Formatted shelf data
 */
export const formatShelfResponse = (shelf) => {
    return {
        shelfId: shelf.id,
        userId: shelf.userId,
        name: shelf.name,
        description: shelf.description,
        works: shelf.works,
        createdAt: shelf.createdAt,
        updatedAt: shelf.updatedAt
    };
};

/**
 * Format work data for API response
 * @param {Object} work - Work object from mock data
 * @returns {Object} Formatted work data
 */
export const formatWorkResponse = (work) => {
    return {
        workId: work.id,
        title: work.title,
        description: work.description,
        type: work.type,
        year: work.year,
        genres: work.genres,
        creator: work.creator,
        coverUrl: work.coverUrl,
        createdAt: work.createdAt,
        updatedAt: work.updatedAt
    };
};
