/**
 * Generate unique ID for mock data
 * @returns {number}
 */
let currentId = 1;
export const generateId = () => currentId++;

/**
 * Reset ID counter (useful for testing)
 */
export const resetIdCounter = () => {
    currentId = 1;
};

/**
 * Calculate average rating from ratings array
 * @param {Array} ratings - Array of rating objects
 * @returns {number}
 */
export const calculateAverageRating = (ratings) => {
    if (!ratings || ratings.length === 0) return 0;
    const sum = ratings.reduce((acc, rating) => acc + rating.score, 0);
    return parseFloat((sum / ratings.length).toFixed(2));
};

/**
 * Safely parse an ID to integer with validation
 * @param {string|number} id - ID to parse
 * @param {string} fieldName - Name of the field (for error messages)
 * @returns {number} Parsed integer ID
 * @throws {Error} If ID is invalid or not a positive integer
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
 * Filter items by search query
 * @param {Array} items - Items to filter
 * @param {string} query - Search query
 * @param {Array} fields - Fields to search in
 * @returns {Array}
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
 * Format work data for consistent API response
 * @param {Object} work - Work object from mock data
 * @param {number} rating - Calculated rating
 * @returns {Object} Formatted work data
 */
export const formatWorkData = (work, rating = 0) => {
    return {
        workId: work.id,
        title: work.title,
        description: work.description,
        type: work.type,
        year: work.year,
        genres: work.genres,
        creator: work.creator,
        rating,
        coverUrl: work.coverUrl,
        foundAt: work.foundAt
    };
};

/**
 * Enrich work with rating from mock ratings
 * @param {Object} work - Work object from mock data
 * @param {Array} mockRatings - Array of mock ratings
 * @returns {Object} Work data with calculated rating
 */
export const enrichWorkWithRating = (work, mockRatings) => {
    const workRatings = mockRatings.filter(r => r.workId === work.id);
    const rating = calculateAverageRating(workRatings);
    return formatWorkData(work, rating);
};

/**
 * Safely parse query param to integer
 * @param {string} value - Query param value
 * @param {string} fieldName - Name of the field (for error messages)
 * @returns {number|null} Parsed integer or null if invalid
 */
export const parseQueryInt = (value, fieldName = 'value') => {
    if (value === undefined || value === '') return null;
    const parsed = parseInt(value, 10);
    return Number.isNaN(parsed) ? null : parsed;
};

/**
 * Safely parse query param to float
 * @param {string} value - Query param value
 * @param {string} fieldName - Name of the field (for error messages)
 * @returns {number|null} Parsed float or null if invalid
 */
export const parseQueryFloat = (value, fieldName = 'value') => {
    if (value === undefined || value === '') return null;
    const parsed = parseFloat(value);
    return Number.isNaN(parsed) ? null : parsed;
};
