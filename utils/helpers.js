/**
 * Utility Helper Functions
 * Common utilities for data manipulation, validation, and formatting.
 */

let currentId = 1;

/**
 * Generate unique ID for mock data
 * @returns {number} Next available ID
 */
export const generateId = () => currentId++;

/**
 * Reset ID counter (primarily for tests)
 * @returns {void}
 */
export const resetIdCounter = () => {
    currentId = 1;
};

/**
 * Calculate average rating rounded to 2 decimals
 * @param {Array<{score: number}>} ratings - Array of rating objects
 * @returns {number} Average rating or 0 if no ratings
 */
export const calculateAverageRating = (ratings) => {
    if (!ratings || ratings.length === 0) return 0;
    const sum = ratings.reduce((acc, rating) => acc + rating.score, 0);
    return parseFloat((sum / ratings.length).toFixed(2));
};

/**
 * Parse and validate ID as positive integer
 * @param {string|number} id - ID to parse
 * @param {string} [fieldName='ID'] - Field name for error messages
 * @returns {number} Validated positive integer
 * @throws {Error} If ID is invalid or not positive
 */
export const safeParseInt = (id, fieldName = 'ID') => {
    const parsed = parseInt(id, 10);

    if (isNaN(parsed)) {
        throw new Error(`Invalid ${fieldName}: must be a number`);
    }

    if (parsed <= 0) {
        throw new Error(`Invalid ${fieldName}: must be a positive integer`);
    }

    return parsed;
};

/**
 * Filter array by case-insensitive text search across fields
 * @param {Array<Object>} items - Array of objects to search
 * @param {string} query - Search text (case-insensitive)
 * @param {string[]} fields - Object keys to search within
 * @returns {Array<Object>} Filtered items matching query
 */
export const searchItems = (items, query, fields) => {
    if (!query) return items;

    const lowerQuery = query.toLowerCase();
    return items.filter(item =>
        fields.some(field => {
            const value = item[field];
            return value && value.toString().toLowerCase().includes(lowerQuery);
        })
    );
};

/**
 * Format work object with rating for API response
 * Maps 'id' to 'workId' for API consistency
 * @param {Object} work - Work object from mock data
 * @param {number} [rating=0] - Calculated average rating
 * @param {number} [ratingCount=0] - Number of ratings
 * @returns {Object} Formatted work with 'workId'
 */
export const formatWorkData = (work, rating = 0, ratingCount = 0) => {
    return {
        workId: work.id,
        title: work.title,
        description: work.description,
        type: work.type,
        year: work.year,
        genres: work.genres,
        creator: work.creator,
        rating,
        ratingCount,
        coverUrl: work.coverUrl,
        foundAt: work.foundAt
    };
};

/**
 * Enrich work with calculated rating from ratings array
 * @param {Object} work - Work object from mock data
 * @param {Array<{workId: number, score: number}>} mockRatings - All ratings
 * @returns {Object} Work with calculated rating and ratingCount fields
 */
export const enrichWorkWithRating = (work, mockRatings) => {
    const workRatings = mockRatings.filter(r => r.workId === work.id);
    const rating = calculateAverageRating(workRatings);
    return formatWorkData(work, rating, workRatings.length);
};

/**
 * Parse query parameter to integer (returns null if invalid)
 * @param {string|undefined} value - Query parameter value
 * @returns {number|null} Parsed integer or null
 */
export const parseQueryInt = (value) => {
    if (value === undefined || value === '') return null;
    const parsed = parseInt(value, 10);
    return Number.isNaN(parsed) ? null : parsed;
};

/**
 * Parse query parameter to float (returns null if invalid)
 * @param {string|undefined} value - Query parameter value
 * @returns {number|null} Parsed float or null
 */
export const parseQueryFloat = (value) => {
    if (value === undefined || value === '') return null;
    const parsed = parseFloat(value);
    return Number.isNaN(parsed) ? null : parsed;
};
