import * as ratingService from '../services/ratingService.js';
import { sendSuccess, sendError } from '../utils/responses.js';
import { HTTP_STATUS } from '../config/constants.js';
import { validateRatingScore } from '../utils/validators.js';

/**
 * Helper to handle common rating service errors
 */
const handleRatingError = (error, res, next) => {
    if (error.message === 'User not found' || error.message === 'Work not found') {
        return sendError(res, HTTP_STATUS.NOT_FOUND, error.message);
    }
    next(error);
};

/**
 * Helper to validate score and return error response if invalid
 */
const validateScoreOrError = (score, res) => {
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
export const getRatingById = async (req, res, next) => {
    try {
        const { ratingId } = req.params;
        const rating = await ratingService.getRatingById(ratingId);

        if (!rating) {
            return sendError(res, HTTP_STATUS.NOT_FOUND, 'Rating not found');
        }

        sendSuccess(res, HTTP_STATUS.OK, rating);
    } catch (error) {
        next(error);
    }
};

/**
 * Get all ratings for a work
 * @route GET /api/works/:workId/ratings
 */
export const getWorkRatings = async (req, res, next) => {
    try {
        const { workId } = req.params;
        const ratings = await ratingService.getWorkRatings(workId);

        sendSuccess(res, HTTP_STATUS.OK, { ratings });
    } catch (error) {
        next(error);
    }
};

/**
 * Create or update a rating for a work
 * @route POST /api/works/:workId/ratings
 */
export const createWorkRating = async (req, res, next) => {
    try {
        const { workId } = req.params;
        const { userId, score } = req.body;

        // Validate userId
        if (!userId) {
            return sendError(res, HTTP_STATUS.BAD_REQUEST, 'Invalid input', ['userId is required']);
        }

        // Validate score
        if (!validateScoreOrError(score, res)) return;

        const rating = await ratingService.createOrUpdateRating(userId, workId, score);

        sendSuccess(res, HTTP_STATUS.CREATED, rating, 'Rating submitted successfully');
    } catch (error) {
        handleRatingError(error, res, next);
    }
};

/**
 * Update a rating
 * @route PUT /api/ratings/:ratingId
 */
export const updateRating = async (req, res, next) => {
    try {
        const { ratingId } = req.params;
        const { score } = req.body;

        // Validate score
        if (!validateScoreOrError(score, res)) return;

        const rating = await ratingService.updateRating(ratingId, score);

        if (!rating) {
            return sendError(res, HTTP_STATUS.NOT_FOUND, 'Rating not found');
        }

        sendSuccess(res, HTTP_STATUS.OK, rating, 'Rating updated successfully');
    } catch (error) {
        next(error);
    }
};

/**
 * Delete a rating
 * @route DELETE /api/ratings/:ratingId
 */
export const deleteRating = async (req, res, next) => {
    try {
        const { ratingId } = req.params;
        const deleted = await ratingService.deleteRating(ratingId);

        if (!deleted) {
            return sendError(res, HTTP_STATUS.NOT_FOUND, 'Rating not found');
        }

        res.status(HTTP_STATUS.NO_CONTENT).send();
    } catch (error) {
        next(error);
    }
};

/**
 * Get all ratings (admin)
 * @route GET /api/ratings
 */
export const getAllRatings = async (req, res, next) => {
    try {
        const ratings = await ratingService.getAllRatings();
        sendSuccess(res, HTTP_STATUS.OK, { ratings });
    } catch (error) {
        next(error);
    }
};

/**
 * Get work average rating
 * @route GET /api/works/:workId/ratings/average
 */
export const getWorkAverageRating = async (req, res, next) => {
    try {
        const { workId } = req.params;
        const result = await ratingService.getWorkAverageRating(workId);

        sendSuccess(res, HTTP_STATUS.OK, result);
    } catch (error) {
        next(error);
    }
};
