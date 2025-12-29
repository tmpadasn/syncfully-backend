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
export const searchItems = catchAsync(async (req, res) => {
    const { query, genre } = req.query;

    const itemType = req.query['item-type'];
    const workType = req.query['work-type'];

    const allowedItemTypes = ['user', 'work']; // shelves not supported

    if (itemType && !allowedItemTypes.includes(itemType.toLowerCase())) {
        return sendError(
            res,
            HTTP_STATUS.BAD_REQUEST,
            `Invalid item-type. Allowed values: ${allowedItemTypes.join(', ')}`
        );
    }

    // rating (min average rating)
    const minRating = parseQueryFloat(req.query.rating);
    if (req.query.rating && minRating === null) {
        return sendError(
            res,
            HTTP_STATUS.BAD_REQUEST,
            'Invalid rating parameter. Must be a number.'
        );
    }

    // year
    const year = parseQueryInt(req.query.year);
    if (req.query.year && year === null) {
        return sendError(
            res,
            HTTP_STATUS.BAD_REQUEST,
            'Invalid year parameter. Must be an integer.'
        );
    }

    const result = await searchService.searchItems({
        query,
        itemType,
        workType,
        genre,
        minRating,
        year
    });

    // Include metadata in the data object for consistency
    const responseData = {
        works: result.works || [],
        users: result.users || [],
        totalWorks: result.works?.length ?? 0,
        totalUsers: result.users?.length ?? 0
    };

    sendSuccess(res, HTTP_STATUS.OK, responseData, 'Search completed successfully');
});

export default {
    searchItems
};
