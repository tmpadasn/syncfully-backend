/**
 * Format user data for API response
 * @param {Object} user - User object from mock data
 * @returns {Object} Formatted user data
 */
export const formatUserResponse = (user) => {
    return {
        userId: user.id,
        username: user.username,
        email: user.email,
        profilePictureUrl: user.profilePictureUrl,
        ratedWorks: Object.keys(user.ratedWorks || {}).length
    };
};

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
