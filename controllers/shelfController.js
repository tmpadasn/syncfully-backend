import * as shelfService from '../services/shelfService.js';
import { sendSuccess, sendError } from '../utils/responses.js';
import { HTTP_STATUS } from '../config/constants.js';
import { parseQueryInt, parseQueryFloat } from '../utils/helpers.js';

/**
 * Get all shelves (across all users)
 * @route GET /api/shelves
 */
export const getAllShelves = async (_req, res, next) => {
    try {
        const shelves = await shelfService.getAllShelves();
        sendSuccess(res, HTTP_STATUS.OK, { shelves });
    } catch (error) {
        next(error);
    }
};

/**
 * Get all shelves for a user
 * @route GET /api/users/:userId/shelves
 */
export const getUserShelves = async (req, res, next) => {
    try {
        const { userId } = req.params;
        const shelves = await shelfService.getUserShelves(userId);

        sendSuccess(res, HTTP_STATUS.OK, { shelves });
    } catch (error) {
        next(error);
    }
};

/**
 * Create a new shelf for a user
 * @route POST /api/users/:userId/shelves
 */
export const createShelf = async (req, res, next) => {
    try {
        const { userId } = req.params;
        const { name, description } = req.body;

        // Validate required fields
        if (!name || name.trim() === '') {
            return sendError(res, HTTP_STATUS.BAD_REQUEST, 'Shelf name is required');
        }

        const shelf = await shelfService.createShelf(userId, {
            name: name.trim(),
            description: description ? description.trim() : ''
        });

        sendSuccess(res, HTTP_STATUS.OK, shelf);
    } catch (error) {
        if (error.code === 11000) {
            return sendError(res, HTTP_STATUS.BAD_REQUEST, 'Shelf name already exists');
        }
        next(error);
    }
};

/**
 * Get a specific shelf
 * @route GET /api/shelves/:shelfId
 */
export const getShelfById = async (req, res, next) => {
    try {
        const { shelfId } = req.params;
        const shelf = await shelfService.getShelfById(shelfId);

        if (!shelf) {
            return sendError(res, HTTP_STATUS.NOT_FOUND, 'Shelf not found');
        }

        sendSuccess(res, HTTP_STATUS.OK, shelf);
    } catch (error) {
        next(error);
    }
};

/**
 * Update a specific shelf
 * @route PUT /api/shelves/:shelfId
 */
export const updateShelf = async (req, res, next) => {
    try {
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

        const shelf = await shelfService.updateShelf(shelfId, updateData);

        if (!shelf) {
            return sendError(res, HTTP_STATUS.NOT_FOUND, 'Shelf not found');
        }

        sendSuccess(res, HTTP_STATUS.OK, shelf);
    } catch (error) {
        if (error.code === 11000) {
            return sendError(res, HTTP_STATUS.BAD_REQUEST, 'Shelf name already exists');
        }
        next(error);
    }
};

/**
 * Delete a specific shelf
 * @route DELETE /api/shelves/:shelfId
 */
export const deleteShelf = async (req, res, next) => {
    try {
        const { shelfId } = req.params;
        const deleted = await shelfService.deleteShelf(shelfId);

        if (!deleted) {
            return sendError(res, HTTP_STATUS.NOT_FOUND, 'Shelf not found');
        }

        res.status(HTTP_STATUS.NO_CONTENT).send();
    } catch (error) {
        next(error);
    }
};

/**
 * Get all works in a shelf with optional filters
 * @route GET /api/shelves/:shelfId/works
 */
export const getShelfWorks = async (req, res, next) => {
    try {
        const { shelfId } = req.params;
        const filters = {};

        // Add work-type filter if provided
        if (req.query['work-type']) {
            filters['work-type'] = req.query['work-type'];
        }

        // Add genre filter if provided
        if (req.query.genre) {
            filters.genre = req.query.genre;
        }

        // Add rating filter if provided
        const rating = parseQueryFloat(req.query.rating);
        if (rating !== null) {
            filters.rating = rating;
        }

        // Add year filter if provided
        const year = parseQueryInt(req.query.year);
        if (year !== null) {
            filters.year = year;
        }

        const shelf = await shelfService.getShelfWorks(shelfId, filters);

        if (!shelf) {
            return sendError(res, HTTP_STATUS.NOT_FOUND, 'Shelf not found');
        }

        // Return works array
        sendSuccess(res, HTTP_STATUS.OK, { works: shelf.works });
    } catch (error) {
        next(error);
    }
};

/**
 * Add a work to a shelf
 * @route POST /api/shelves/:shelfId/works/:workId
 */
export const addWorkToShelf = async (req, res, next) => {
    try {
        const { shelfId, workId } = req.params;

        const shelf = await shelfService.addWorkToShelf(shelfId, workId);

        if (!shelf) {
            return sendError(res, HTTP_STATUS.NOT_FOUND, 'Shelf not found');
        }

        sendSuccess(res, HTTP_STATUS.OK, shelf);
    } catch (error) {
        next(error);
    }
};

/**
 * Remove a work from a shelf
 * @route DELETE /api/shelves/:shelfId/works/:workId
 */
export const removeWorkFromShelf = async (req, res, next) => {
    try {
        const { shelfId, workId } = req.params;

        const shelf = await shelfService.removeWorkFromShelf(shelfId, workId);

        if (!shelf) {
            return sendError(res, HTTP_STATUS.NOT_FOUND, 'Shelf not found');
        }

        sendSuccess(res, HTTP_STATUS.OK, shelf);
    } catch (error) {
        next(error);
    }
};
