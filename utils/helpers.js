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
            if (typeof value === 'string') {
                return value.toLowerCase().includes(lowerQuery);
            }
            if (Array.isArray(value)) {
                return value.some(v => v.toLowerCase().includes(lowerQuery));
            }
            return false;
        })
    );
};
