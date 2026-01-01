/**
 * @fileoverview Work Controller
 * @description Handles CRUD operations and discovery features for media works.
 *
 * This controller manages movies, books, music, series, and graphic novels.
 * It provides endpoints for listing, filtering, creating, updating, and
 * deleting works, as well as finding similar and popular content.
 *
 * Routes handled:
 *   GET    /api/works           - List all works (with filters)
 *   POST   /api/works           - Create new work
 *   GET    /api/works/:workId   - Get work by ID
 *   PUT    /api/works/:workId   - Update work
 *   DELETE /api/works/:workId   - Delete work
 *   GET    /api/works/popular   - Get popular works
 *   GET    /api/works/:workId/similar - Get similar works
 *
 * @module controllers/workController
 * @see services/workService - Business logic for works
 * @see models/Work - Work data model
 */

import * as workService from '../services/workService.js';
import { sendSuccess, sendError } from '../utils/responses.js';
import { HTTP_STATUS } from '../config/constants.js';
import { devLog } from '../utils/logger.js';
import { parseQueryInt } from '../utils/helpers.js';
import { catchAsync } from '../utils/catchAsync.js';

/**
 * Get work by ID
 * @route GET /api/works/:workId
 */
export const getWorkById = catchAsync(async (req, res) => {
    const { workId } = req.params;
    const work = await workService.getWorkById(workId);

    if (!work) {
        return sendError(res, HTTP_STATUS.NOT_FOUND, 'Work not found');
    }

    sendSuccess(res, HTTP_STATUS.OK, work);
});

/**
 * Get all works
 * @route GET /api/works
 */
export const getAllWorks = catchAsync(async (req, res) => {
    const filters = {};

    // Add type filter if provided
    if (req.query.type) {
        filters.type = req.query.type;
    }

    // Add year filter if provided
    const year = parseQueryInt(req.query.year);
    if (year !== null) {
        filters.year = year;
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
});

/**
 * Get similar works
 * @route GET /api/works/:workId/similar
 */
export const getSimilarWorks = catchAsync(async (req, res) => {
    const { workId } = req.params;
    const works = await workService.getSimilarWorks(workId);

    if (works === null) {
        return sendError(res, HTTP_STATUS.NOT_FOUND, 'Work not found');
    }

    sendSuccess(res, HTTP_STATUS.OK, { works });
});

/**
 * Get popular works
 * @route GET /api/works/popular
 */
// eslint-disable-next-line no-unused-vars
export const getPopularWorks = catchAsync(async (_req, res) => {
    const works = await workService.getPopularWorks();
    sendSuccess(res, HTTP_STATUS.OK, { works });
});

/**
 * Create new work
 * @route POST /api/works
 */
export const createWork = catchAsync(async (req, res) => {
    const work = await workService.createWork(req.body);
    sendSuccess(res, HTTP_STATUS.CREATED, work, 'Work created successfully');
});

/**
 * Update work
 * @route PUT /api/works/:workId
 */
export const updateWork = catchAsync(async (req, res) => {
    const { workId } = req.params;
    const work = await workService.updateWork(workId, req.body);

    if (!work) {
        return sendError(res, HTTP_STATUS.NOT_FOUND, 'Work not found');
    }

    sendSuccess(res, HTTP_STATUS.OK, work, 'Work updated successfully');
});

/**
 * Delete work
 * @route DELETE /api/works/:workId
 */
export const deleteWork = catchAsync(async (req, res) => {
    const { workId } = req.params;
    const deleted = await workService.deleteWork(workId);

    if (!deleted) {
        return sendError(res, HTTP_STATUS.NOT_FOUND, 'Work not found');
    }

    res.status(HTTP_STATUS.NO_CONTENT).send();
});
