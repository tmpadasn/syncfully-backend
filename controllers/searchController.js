// controllers/searchController.js
import * as searchService from '../services/searchService.js';
import { sendSuccess, sendError } from '../utils/responses.js';
import { HTTP_STATUS } from '../config/constants.js';
import { parseQueryInt, parseQueryFloat } from '../utils/helpers.js';
import { catchAsync } from '../utils/catchAsync.js';

/**
 * GET /search
 * Query params:
 * - query: string
 * - item-type: string (user | work)
 * - work-type: string (book | graphic-novel | series | movie | music)
 * - genre: string
 * - rating: number (minimum average rating)
 * - year: integer
 */
const ALLOWED_ITEM_TYPES = ['user', 'work'];

/**
 * Validates the item-type query parameter.
 * @returns {string|null} Error message or null if valid.
 */
const validateItemType = (itemType) => {
    if (itemType && !ALLOWED_ITEM_TYPES.includes(itemType.toLowerCase())) {
        return `Invalid item-type. Allowed values: ${ALLOWED_ITEM_TYPES.join(', ')}`;
    }
    return null;
};

/**
 * Validates and parses the rating query parameter.
 * @returns {{ value: number|null, error: string|null }}
 */
const validateRating = (ratingParam) => {
    if (!ratingParam) {
        return { value: null, error: null };
    }
    const minRating = parseQueryFloat(ratingParam);
    if (minRating === null) {
        return { value: null, error: 'Invalid rating parameter. Must be a number.' };
    }
    return { value: minRating, error: null };
};

/**
 * Validates and parses the year query parameter.
 * @returns {{ value: number|null, error: string|null }}
 */
const validateYear = (yearParam) => {
    if (!yearParam) {
        return { value: null, error: null };
    }
    const year = parseQueryInt(yearParam);
    if (year === null) {
        return { value: null, error: 'Invalid year parameter. Must be an integer.' };
    }
    return { value: year, error: null };
};

/**
 * Builds the response data object from search results.
 */
const buildResponseData = (result) => ({
    works: result.works || [],
    users: result.users || [],
    totalWorks: result.works?.length ?? 0,
    totalUsers: result.users?.length ?? 0
});

export const searchItems = catchAsync(async (req, res) => {
    const { query, genre } = req.query;
    const itemType = req.query['item-type'];
    const workType = req.query['work-type'];

    // Validate item-type
    const itemTypeError = validateItemType(itemType);
    if (itemTypeError) {
        return sendError(res, HTTP_STATUS.BAD_REQUEST, itemTypeError);
    }

    // Validate rating
    const { value: minRating, error: ratingError } = validateRating(req.query.rating);
    if (ratingError) {
        return sendError(res, HTTP_STATUS.BAD_REQUEST, ratingError);
    }

    // Validate year
    const { value: year, error: yearError } = validateYear(req.query.year);
    if (yearError) {
        return sendError(res, HTTP_STATUS.BAD_REQUEST, yearError);
    }

    const result = await searchService.searchItems({
        query, itemType, workType, genre, minRating, year
    });

    sendSuccess(res, HTTP_STATUS.OK, buildResponseData(result), 'Search completed successfully');
});

export default {
    searchItems
};
