import * as ratingService from '../services/ratingService.js';
import { sendSuccess, sendError } from '../utils/responses.js';
import { HTTP_STATUS } from '../config/constants.js';
import { validateRatingScore } from '../utils/validators.js';
import { catchAsync } from '../utils/catchAsync.js';

/**
 * Helper to validate score and return error response if invalid
 * Returns true if valid, false if invalid (and response sent)
 */
const validateScoreOrSendError = (score, res) => {
    const validation = validateRatingScore(score);
    if (!validation.valid) {
        sendError(res, HTTP_STATUS.BAD_REQUEST, 'Invalid input', validation.errors);
        return false;
    }
    return true;
};

/**
 * Get rating by ID
 * @route GET /api/ratings/:ratingId
 */
export const getRatingById = catchAsync(async (req, res) => {
    const { ratingId } = req.params;
    const rating = await ratingService.getRatingById(ratingId);

    if (!rating) {
        return sendError(res, HTTP_STATUS.NOT_FOUND, 'Rating not found');
    }

    sendSuccess(res, HTTP_STATUS.OK, rating);
});

/**
 * Get all ratings for a work
 * @route GET /api/works/:workId/ratings
 */
export const getWorkRatings = catchAsync(async (req, res) => {
    const { workId } = req.params;
    const ratings = await ratingService.getWorkRatings(workId);

    sendSuccess(res, HTTP_STATUS.OK, { ratings });
});

/**
 * Create or update a rating for a work
 * @route POST /api/works/:workId/ratings
 */
export const createWorkRating = catchAsync(async (req, res, next) => {
    const { workId } = req.params;
    const { userId, score } = req.body;

    // Validate userId
    if (!userId) {
        return sendError(res, HTTP_STATUS.BAD_REQUEST, 'Invalid input', ['userId is required']);
    }

    // Validate score
    if (!validateScoreOrSendError(score, res)) return;

    try {
        const rating = await ratingService.createOrUpdateRating(userId, workId, score);
        sendSuccess(res, HTTP_STATUS.CREATED, rating, 'Rating submitted successfully');
    } catch (error) {
        // Specific business logic errors
        if (error.message === 'User not found' || error.message === 'Work not found') {
            return sendError(res, HTTP_STATUS.NOT_FOUND, error.message);
        }
        throw error;
    }
});

/**
 * Update a rating
 * @route PUT /api/ratings/:ratingId
 */
export const updateRating = catchAsync(async (req, res) => {
    const { ratingId } = req.params;
    const { score } = req.body;

    // Validate score
    if (!validateScoreOrSendError(score, res)) return;

    const rating = await ratingService.updateRating(ratingId, score);

    if (!rating) {
        return sendError(res, HTTP_STATUS.NOT_FOUND, 'Rating not found');
    }

    sendSuccess(res, HTTP_STATUS.OK, rating, 'Rating updated successfully');
});

/**
 * Delete a rating
 * @route DELETE /api/ratings/:ratingId
 */
export const deleteRating = catchAsync(async (req, res) => {
    const { ratingId } = req.params;
    const deleted = await ratingService.deleteRating(ratingId);

    if (!deleted) {
        return sendError(res, HTTP_STATUS.NOT_FOUND, 'Rating not found');
    }

    res.status(HTTP_STATUS.NO_CONTENT).send();
});

/**
 * Get all ratings (admin)
 * @route GET /api/ratings
 */
// eslint-disable-next-line no-unused-vars
export const getAllRatings = catchAsync(async (_req, res) => {
    const ratings = await ratingService.getAllRatings();
    sendSuccess(res, HTTP_STATUS.OK, { ratings });
});

/**
 * Get work average rating
 * @route GET /api/works/:workId/ratings/average
 */
export const getWorkAverageRating = catchAsync(async (req, res) => {
    const { workId } = req.params;
    const result = await ratingService.getWorkAverageRating(workId);

    sendSuccess(res, HTTP_STATUS.OK, result);
});
