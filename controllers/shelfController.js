/**
 * @fileoverview Shelf Controller
 * @description Handles CRUD operations for user shelves (collections).
 *
 * Shelves are user-created collections for organizing works (like playlists).
 * Examples: "To Watch", "Favorites", "Summer Reading List"
 *
 * Routes handled:
 *   GET    /api/shelves                    - List all shelves (admin)
 *   GET    /api/shelves/:shelfId           - Get shelf by ID
 *   PUT    /api/shelves/:shelfId           - Update shelf
 *   DELETE /api/shelves/:shelfId           - Delete shelf
 *   GET    /api/shelves/:shelfId/works     - Get works in shelf (with filters)
 *   POST   /api/shelves/:shelfId/works/:workId  - Add work to shelf
 *   DELETE /api/shelves/:shelfId/works/:workId  - Remove work from shelf
 *   GET    /api/users/:userId/shelves      - Get user's shelves
 *   POST   /api/users/:userId/shelves      - Create shelf for user
 *
 * @module controllers/shelfController
 * @see services/shelfService - Business logic for shelves
 * @see models/Shelf - Shelf data model
 */

import * as shelfService from '../services/shelfService.js';
import { sendSuccess, sendError } from '../utils/responses.js';
import { HTTP_STATUS } from '../config/constants.js';
import { parseQueryInt, parseQueryFloat } from '../utils/helpers.js';
import { catchAsync } from '../utils/catchAsync.js';

/**
 * Get all shelves (across all users)
 * @route GET /api/shelves
 */
// eslint-disable-next-line no-unused-vars
export const getAllShelves = catchAsync(async (_req, res) => {
    const shelves = await shelfService.getAllShelves();
    sendSuccess(res, HTTP_STATUS.OK, { shelves });
});

/**
 * Get all shelves for a user
 * @route GET /api/users/:userId/shelves
 */
export const getUserShelves = catchAsync(async (req, res) => {
    const { userId } = req.params;
    const shelves = await shelfService.getUserShelves(userId);

    sendSuccess(res, HTTP_STATUS.OK, { shelves });
});

/**
 * Create a new shelf for a user
 * @route POST /api/users/:userId/shelves
 */
export const createShelf = catchAsync(async (req, res) => {
    const { userId } = req.params;
    const { name, description } = req.body;

    // Validate required fields
    if (!name || name.trim() === '') {
        return sendError(res, HTTP_STATUS.BAD_REQUEST, 'Shelf name is required');
    }

    try {
        const shelf = await shelfService.createShelf(userId, {
            name: name.trim(),
            description: description ? description.trim() : ''
        });

        sendSuccess(res, HTTP_STATUS.OK, shelf);
    } catch (error) {
        if (error.code === 11000) {
            return sendError(res, HTTP_STATUS.BAD_REQUEST, 'Shelf name already exists');
        }
        throw error;
    }
});

/**
 * Get a specific shelf
 * @route GET /api/shelves/:shelfId
 */
export const getShelfById = catchAsync(async (req, res) => {
    const { shelfId } = req.params;
    const shelf = await shelfService.getShelfById(shelfId);

    if (!shelf) {
        return sendError(res, HTTP_STATUS.NOT_FOUND, 'Shelf not found');
    }

    sendSuccess(res, HTTP_STATUS.OK, shelf);
});

/**
 * Update a specific shelf
 * @route PUT /api/shelves/:shelfId
 */
export const updateShelf = catchAsync(async (req, res) => {
    const { shelfId } = req.params;
    const { name, description } = req.body;

    // Validate at least one field is provided
    if (!name && description === undefined) {
        return sendError(res, HTTP_STATUS.BAD_REQUEST, 'At least one field is required for update');
    }

    // Validate name is not empty if provided
    if (name && name.trim() === '') {
        return sendError(res, HTTP_STATUS.BAD_REQUEST, 'Shelf name cannot be empty');
    }

    const updateData = {};
    if (name) updateData.name = name.trim();
    if (description !== undefined) updateData.description = description.trim();

    try {
        const shelf = await shelfService.updateShelf(shelfId, updateData);

        if (!shelf) {
            return sendError(res, HTTP_STATUS.NOT_FOUND, 'Shelf not found');
        }

        sendSuccess(res, HTTP_STATUS.OK, shelf);
    } catch (error) {
        if (error.code === 11000) {
            return sendError(res, HTTP_STATUS.BAD_REQUEST, 'Shelf name already exists');
        }
        throw error;
    }
});

/**
 * Delete a specific shelf
 * @route DELETE /api/shelves/:shelfId
 */
export const deleteShelf = catchAsync(async (req, res) => {
    const { shelfId } = req.params;
    const deleted = await shelfService.deleteShelf(shelfId);

    if (!deleted) {
        return sendError(res, HTTP_STATUS.NOT_FOUND, 'Shelf not found');
    }

    res.status(HTTP_STATUS.NO_CONTENT).send();
});

/**
 * Get all works in a shelf with optional filters
 * @route GET /api/shelves/:shelfId/works
 */
export const getShelfWorks = catchAsync(async (req, res) => {
    const { shelfId } = req.params;

    // Construct filters
    const filters = {};
    if (req.query['work-type']) filters['work-type'] = req.query['work-type'];
    if (req.query.genre) filters.genre = req.query.genre;

    const rating = parseQueryFloat(req.query.rating);
    if (rating !== null) filters.rating = rating;

    const year = parseQueryInt(req.query.year);
    if (year !== null) filters.year = year;

    const shelf = await shelfService.getShelfWorks(shelfId, filters);

    if (!shelf) {
        return sendError(res, HTTP_STATUS.NOT_FOUND, 'Shelf not found');
    }

    // Return works array
    sendSuccess(res, HTTP_STATUS.OK, { works: shelf.works });
});

/**
 * Add a work to a shelf
 * @route POST /api/shelves/:shelfId/works/:workId
 */
export const addWorkToShelf = catchAsync(async (req, res) => {
    const { shelfId, workId } = req.params;

    const shelf = await shelfService.addWorkToShelf(shelfId, workId);

    if (!shelf) {
        return sendError(res, HTTP_STATUS.NOT_FOUND, 'Shelf not found');
    }

    sendSuccess(res, HTTP_STATUS.OK, shelf);
});

/**
 * Remove a work from a shelf
 * @route DELETE /api/shelves/:shelfId/works/:workId
 */
export const removeWorkFromShelf = catchAsync(async (req, res) => {
    const { shelfId, workId } = req.params;

    const shelf = await shelfService.removeWorkFromShelf(shelfId, workId);

    if (!shelf) {
        return sendError(res, HTTP_STATUS.NOT_FOUND, 'Shelf not found');
    }

    sendSuccess(res, HTTP_STATUS.OK, shelf);
});
