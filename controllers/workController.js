import * as workService from '../services/workService.js';
import { sendSuccess, sendError } from '../utils/responses.js';
import { HTTP_STATUS } from '../config/constants.js';
import { devLog } from '../utils/logger.js';

/**
 * Get work by ID
 * @route GET /api/works/:workId
 */
export const getWorkById = async (req, res, next) => {
    try {
        const { workId } = req.params;
        const work = await workService.getWorkById(workId);

        if (!work) {
            return sendError(res, HTTP_STATUS.NOT_FOUND, 'Work not found');
        }

        sendSuccess(res, HTTP_STATUS.OK, work);
    } catch (error) {
        next(error);
    }
};

/**
 * Get all works
 * @route GET /api/works
 */
export const getAllWorks = async (req, res, next) => {
    try {
        const filters = {};

        // Add type filter if provided
        if (req.query.type) {
            filters.type = req.query.type;
        }

        // Add year filter if provided
        if (req.query.year) {
            filters.year = parseInt(req.query.year);
        }

        // Add genres filter if provided
        if (req.query.genres) {
            // Handle both comma-separated string and array
            filters.genres = Array.isArray(req.query.genres)
                ? req.query.genres
                : req.query.genres.split(',').map(g => g.trim());
        }

        devLog('Filters applied:', filters);

        const works = await workService.getAllWorks(filters);
        sendSuccess(res, HTTP_STATUS.OK, { works });
    } catch (error) {
        next(error);
    }
};

/**
 * Get similar works
 * @route GET /api/works/:workId/similar
 */
export const getSimilarWorks = async (req, res, next) => {
    try {
        const { workId } = req.params;
        const works = await workService.getSimilarWorks(workId);

        if (works === null) {
            return sendError(res, HTTP_STATUS.NOT_FOUND, 'Work not found');
        }

        sendSuccess(res, HTTP_STATUS.OK, { works });
    } catch (error) {
        next(error);
    }
};

/**
 * Get popular works
 * @route GET /api/works/popular
 */
export const getPopularWorks = async (req, res, next) => {
    try {
        const works = await workService.getPopularWorks();
        sendSuccess(res, HTTP_STATUS.OK, { works });
    } catch (error) {
        next(error);
    }
};

/**
 * Create new work
 * @route POST /api/works
 */
export const createWork = async (req, res, next) => {
    try {
        const work = await workService.createWork(req.body);
        sendSuccess(res, HTTP_STATUS.CREATED, work, 'Work created successfully');
    } catch (error) {
        next(error);
    }
};

/**
 * Update work
 * @route PUT /api/works/:workId
 */
export const updateWork = async (req, res, next) => {
    try {
        const { workId } = req.params;
        const work = await workService.updateWork(workId, req.body);

        if (!work) {
            return sendError(res, HTTP_STATUS.NOT_FOUND, 'Work not found');
        }

        sendSuccess(res, HTTP_STATUS.OK, work, 'Work updated successfully');
    } catch (error) {
        next(error);
    }
};

/**
 * Delete work
 * @route DELETE /api/works/:workId
 */
export const deleteWork = async (req, res, next) => {
    try {
        const { workId } = req.params;
        const deleted = await workService.deleteWork(workId);

        if (!deleted) {
            return sendError(res, HTTP_STATUS.NOT_FOUND, 'Work not found');
        }

        res.status(HTTP_STATUS.NO_CONTENT).send();
    } catch (error) {
        next(error);
    }
};
