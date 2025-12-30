/**
 * Utility Helper Functions
 *
 * Common utilities used across the application.
 * These provide reusable logic for data manipulation, validation, and formatting.
 */

/**
 * In-memory ID counter for mock data generation
 *
 * Used when database is not available. Starts at 1 and increments.
 * Not suitable for production - use database auto-increment instead.
 *
 * @private
 */
let currentId = 1;

/**
 * Generate unique ID for mock data
 *
 * Creates sequential IDs for mock data objects.
 * Not thread-safe - resets on server restart.
 *
 * @returns {number} Next available ID
 * @example
 * const newUser = { id: generateId(), name: 'Alice' };
 */
export const generateId = () => currentId++;

/**
 * Reset ID counter to initial state
 *
 * Used primarily in test suites to ensure predictable IDs.
 * Call this in test setup to avoid ID collisions between tests.
 *
 * @returns {void}
 */
export const resetIdCounter = () => {
    currentId = 1;
};

/**
 * Calculate average rating from ratings array
 *
 * Computes mean rating rounded to 2 decimal places (e.g., 4.25).
 * Returns 0 for empty arrays to avoid NaN in API responses.
 *
 * @param {Array<{score: number}>} ratings - Array of rating objects with score property
 * @returns {number} Average rating (0.00 - 5.00) or 0 if no ratings
 * @example
 * calculateAverageRating([{score: 5}, {score: 4}]) // Returns 4.50
 * calculateAverageRating([]) // Returns 0
 */
export const calculateAverageRating = (ratings) => {
    if (!ratings || ratings.length === 0) return 0;
    const sum = ratings.reduce((acc, rating) => acc + rating.score, 0);
    return parseFloat((sum / ratings.length).toFixed(2));
};

/**
 * Safely parse string/number to positive integer with validation
 *
 * Converts user input to integer and validates it's positive.
 * Throws descriptive errors for invalid input to fail fast.
 * Used for route params and query params that must be valid IDs.
 *
 * @param {string|number} id - ID to parse (from req.params or req.query)
 * @param {string} [fieldName='ID'] - Field name for error messages
 * @returns {number} Validated positive integer
 * @throws {Error} If ID is NaN or not positive
 * @example
 * safeParseInt('123', 'userId') // Returns 123
 * safeParseInt('abc', 'userId') // Throws "Invalid userId: must be a number"
 * safeParseInt('-5', 'workId') // Throws "Invalid workId: must be a positive integer"
 */
export const safeParseInt = (id, fieldName = 'ID') => {
    const parsed = parseInt(id, 10);

    // Reject non-numeric input
    if (isNaN(parsed)) {
        throw new Error(`Invalid ${fieldName}: must be a number`);
    }

    // Reject zero and negative numbers (IDs start at 1)
    if (parsed <= 0) {
        throw new Error(`Invalid ${fieldName}: must be a positive integer`);
    }

    return parsed;
};

/**
 * Filter array by case-insensitive text search across multiple fields
 *
 * Searches specified fields for partial matches (substring search).
 * Handles missing fields gracefully - skips if field doesn't exist.
 * Returns original array if query is empty.
 *
 * @param {Array<Object>} items - Array of objects to search
 * @param {string} query - Search text (case-insensitive)
 * @param {string[]} fields - Object keys to search within
 * @returns {Array<Object>} Filtered items matching query
 * @example
 * const users = [{name: 'Alice', email: 'alice@example.com'}];
 * searchItems(users, 'ali', ['name', 'email']) // Returns Alice
 * searchItems(users, '', ['name']) // Returns all users
 */
export const searchItems = (items, query, fields) => {
    // Short-circuit if no query provided
    if (!query) return items;

    const lowerQuery = query.toLowerCase();
    return items.filter(item =>
        // Match if ANY field contains the query
        fields.some(field => {
            const value = item[field];
            // Handle null/undefined fields and convert to string for comparison
            return value && value.toString().toLowerCase().includes(lowerQuery);
        })
    );
};

/**
 * Format work object for consistent API response structure
 *
 * Transforms internal work object to public API format.
 * Ensures all responses have the same shape for frontend consistency.
 * Maps 'id' to 'workId' to match API convention.
 *
 * @param {Object} work - Work object from mock data with 'id' field
 * @param {number} [rating=0] - Calculated average rating
 * @returns {Object} Formatted work with 'workId' instead of 'id'
 * @private Internal helper - use enrichWorkWithRating instead
 */
export const formatWorkData = (work, rating = 0) => {
    return {
        workId: work.id,  // Rename id -> workId for API consistency
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
 * Enrich work object with calculated rating from ratings array
 *
 * Combines work data with its average rating.
 * Filters ratings to only include those matching the work.
 * Returns formatted object ready for API response.
 *
 * @param {Object} work - Work object from mock data
 * @param {Array<{workId: number, score: number}>} mockRatings - All ratings
 * @returns {Object} Work with calculated rating field
 * @example
 * const work = { id: 1, title: 'Inception', ... };
 * const ratings = [{workId: 1, score: 5}, {workId: 1, score: 4}];
 * enrichWorkWithRating(work, ratings) // Returns work with rating: 4.5
 */
export const enrichWorkWithRating = (work, mockRatings) => {
    // Filter to only ratings for this specific work
    const workRatings = mockRatings.filter(r => r.workId === work.id);
    const rating = calculateAverageRating(workRatings);
    return formatWorkData(work, rating);
};

/**
 * Parse query parameter to integer with lenient validation
 *
 * Unlike safeParseInt, returns null instead of throwing on invalid input.
 * Used for optional query params where invalid = filter disabled.
 * Treats empty string and undefined as "not provided".
 *
 * @param {string|undefined} value - Query parameter value from req.query
 * @param {string} [fieldName='value'] - Field name (for future error handling)
 * @returns {number|null} Parsed integer or null if invalid/missing
 * @example
 * parseQueryInt('2020', 'year') // Returns 2020
 * parseQueryInt('', 'year') // Returns null
 * parseQueryInt('abc', 'year') // Returns null (doesn't throw)
 */
export const parseQueryInt = (value) => {
    if (value === undefined || value === '') return null;
    const parsed = parseInt(value, 10);
    // Return null instead of NaN to indicate "no filter"
    return Number.isNaN(parsed) ? null : parsed;
};

/**
 * Parse query parameter to float with lenient validation
 *
 * Similar to parseQueryInt but preserves decimal precision.
 * Used for rating filters where decimals are meaningful (e.g., 4.5 stars).
 * Returns null for invalid input instead of throwing.
 *
 * @param {string|undefined} value - Query parameter value from req.query
 * @param {string} [fieldName='value'] - Field name (for future error handling)
 * @returns {number|null} Parsed float or null if invalid/missing
 * @example
 * parseQueryFloat('4.5', 'rating') // Returns 4.5
 * parseQueryFloat('', 'rating') // Returns null
 * parseQueryFloat('abc', 'rating') // Returns null
 */
export const parseQueryFloat = (value) => {
    if (value === undefined || value === '') return null;
    const parsed = parseFloat(value);
    return Number.isNaN(parsed) ? null : parsed;
};
