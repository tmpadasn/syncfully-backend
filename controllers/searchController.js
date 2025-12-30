/**
 * Search Controller
 * 
 * Handles search operations for users and works (books, movies, music, etc.).
 * Supports filtering by item type, work type, genre, rating, and year.
 * 
 * @module controllers/searchController
 */

import * as searchService from '../services/searchService.js';
import { sendSuccess, sendError } from '../utils/responses.js';
import { HTTP_STATUS } from '../config/constants.js';
import { parseQueryInt, parseQueryFloat } from '../utils/helpers.js';
import { catchAsync } from '../utils/catchAsync.js';

// ============================================================================
// CONSTANTS
// ============================================================================

/** Valid item types for search filtering */
const ALLOWED_ITEM_TYPES = ['user', 'work'];

// ============================================================================
// VALIDATION HELPERS
// ============================================================================

/**
 * Validates the item-type query parameter.
 * @param {string|undefined} itemType - Item type to validate
 * @returns {string|null} Error message if invalid, null if valid
 */
const validateItemType = (itemType) => {
    if (itemType && !ALLOWED_ITEM_TYPES.includes(itemType.toLowerCase())) {
        return `Invalid item-type. Allowed values: ${ALLOWED_ITEM_TYPES.join(', ')}`;
    }
    return null;
};

/**
 * Validates and parses a numeric query parameter.
 * @param {string|undefined} param - Raw parameter value
 * @param {Function} parser - Parser function (parseQueryInt or parseQueryFloat)
 * @param {string} errorMessage - Error message if validation fails
 * @returns {{ value: number|null, error: string|null }}
 */
const validateNumericParam = (param, parser, errorMessage) => {
    if (!param) {
        return { value: null, error: null };
    }
    const parsed = parser(param);
    if (parsed === null) {
        return { value: null, error: errorMessage };
    }
    return { value: parsed, error: null };
};

/**
 * Validates and parses the rating query parameter.
 * @param {string|undefined} ratingParam - Rating parameter value
 * @returns {{ value: number|null, error: string|null }}
 */
const validateRating = (ratingParam) => {
    return validateNumericParam(
        ratingParam,
        parseQueryFloat,
        'Invalid rating parameter. Must be a number.'
    );
};

/**
 * Validates and parses the year query parameter.
 * @param {string|undefined} yearParam - Year parameter value
 * @returns {{ value: number|null, error: string|null }}
 */
const validateYear = (yearParam) => {
    return validateNumericParam(
        yearParam,
        parseQueryInt,
        'Invalid year parameter. Must be an integer.'
    );
};

/**
 * Validates all search parameters and returns validated values or first error.
 * @param {Object} params - Query parameters
 * @returns {{ valid: boolean, error?: string, values?: Object }}
 */
const validateSearchParams = (params) => {
    const { itemType, rating, year } = params;

    // Validate item-type
    const itemTypeError = validateItemType(itemType);
    if (itemTypeError) {
        return { valid: false, error: itemTypeError };
    }

    // Validate rating
    const ratingResult = validateRating(rating);
    if (ratingResult.error) {
        return { valid: false, error: ratingResult.error };
    }

    // Validate year
    const yearResult = validateYear(year);
    if (yearResult.error) {
        return { valid: false, error: yearResult.error };
    }

    return {
        valid: true,
        values: {
            minRating: ratingResult.value,
            year: yearResult.value
        }
    };
};

// ============================================================================
// RESPONSE BUILDERS
// ============================================================================

/**
 * Builds the response data object from search results.
 * @param {Object} result - Raw search results from service
 * @param {Array} [result.works] - Found works
 * @param {Array} [result.users] - Found users
 * @returns {Object} Formatted response data
 */
const buildResponseData = (result) => ({
    works: result.works || [],
    users: result.users || [],
    totalWorks: result.works?.length ?? 0,
    totalUsers: result.users?.length ?? 0
});

// ============================================================================
// ROUTE HANDLERS
// ============================================================================

/**
 * Searches for items (users or works) based on query parameters.
 * 
 * @route GET /search
 * @query {string} [query] - Search text
 * @query {string} [item-type] - Filter by type: 'user' or 'work'
 * @query {string} [work-type] - Filter by work type: 'book', 'graphic-novel', 'series', 'movie', 'music'
 * @query {string} [genre] - Filter by genre
 * @query {number} [rating] - Minimum average rating
 * @query {number} [year] - Filter by release year
 * @returns {Object} Search results with works, users, and totals
 * @throws {400} Invalid parameter values
 */
export const searchItems = catchAsync(async (req, res) => {
    const { query, genre } = req.query;
    const itemType = req.query['item-type'];
    const workType = req.query['work-type'];

    // Validate all parameters
    const validation = validateSearchParams({
        itemType,
        rating: req.query.rating,
        year: req.query.year
    });

    if (!validation.valid) {
        return sendError(res, HTTP_STATUS.BAD_REQUEST, validation.error);
    }

    // Execute search
    const result = await searchService.searchItems({
        query,
        itemType,
        workType,
        genre,
        minRating: validation.values.minRating,
        year: validation.values.year
    });

    return sendSuccess(
        res,
        HTTP_STATUS.OK,
        buildResponseData(result),
        'Search completed successfully'
    );
});

export default {
    searchItems
};
