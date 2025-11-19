// controllers/searchController.js
import * as searchService from '../services/searchService.js';

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
export const searchItems = async (req, res, next) => {
    try {
        const { query, genre } = req.query;

        const itemType = req.query['item-type'];
        const workType = req.query['work-type'];

        const allowedItemTypes = ['user', 'work']; // shelves not supported

        if (itemType && !allowedItemTypes.includes(itemType.toLowerCase())) {
            return res.status(400).json({
                success: false,
                message: `Invalid item-type. Allowed values: ${allowedItemTypes.join(', ')}`
            });
        }

        // rating (min average rating)
        let minRating;
        if (req.query.rating !== undefined && req.query.rating !== '') {
            minRating = parseFloat(req.query.rating);
            if (Number.isNaN(minRating)) {
                return res.status(400).json({
                    success: false,
                    message: 'Invalid rating parameter. Must be a number.'
                });
            }
        }

        // year
        let year;
        if (req.query.year !== undefined && req.query.year !== '') {
            year = parseInt(req.query.year, 10);
            if (Number.isNaN(year)) {
                return res.status(400).json({
                    success: false,
                    message: 'Invalid year parameter. Must be an integer.'
                });
            }
        }

        const result = await searchService.searchItems({
            query,
            itemType,
            workType,
            genre,
            minRating,
            year
        });

        return res.status(200).json({
            success: true,
            data: result,
            meta: {
                totalWorks: result.works?.length ?? 0,
                totalUsers: result.users?.length ?? 0
            }
        });
    } catch (error) {
        next(error);
    }
};

export default {
    searchItems
};
