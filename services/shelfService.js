import { mockShelves, getNextShelfId } from '../data/mockShelves.js';
import { safeParseInt } from '../utils/helpers.js';
import { NotFoundError } from '../utils/errors.js';

/**
 * Helper: Find and return shelf or throw error
 * @param {number|string} shelfId - Shelf ID
 * @returns {Object} Shelf object
 * @throws {NotFoundError} If shelf not found
 */
const findShelfOrThrow = (shelfId) => {
    const parsedId = safeParseInt(shelfId, 'shelfId');
    const shelf = mockShelves.find(s => s.id === parsedId);
    if (!shelf) throw new NotFoundError('Shelf not found');
    return shelf;
};

/**
 * Helper: Format shelf data for response
 * @param {Object} shelf - Shelf object from mock data
 * @returns {Object} Formatted shelf data
 */
const formatShelfData = (shelf) => {
    return {
        shelfId: shelf.id,
        userId: shelf.userId,
        name: shelf.name,
        description: shelf.description,
        works: shelf.works,
        createdAt: shelf.createdAt,
        updatedAt: shelf.updatedAt
    };
};

/**
 * Get all shelves (across all users)
 * @returns {Promise<Array>}
 */
export const getAllShelves = async () => {
    return mockShelves.map(formatShelfData);
};

/**
 * Get all shelves for a user
 * @param {string} userId - User ID
 * @returns {Promise<Array>}
 */
export const getUserShelves = async (userId) => {
    const parsedId = safeParseInt(userId, 'userId');
    return mockShelves
        .filter(shelf => shelf.userId === parsedId)
        .map(formatShelfData);
};

/**
 * Get a specific shelf by ID
 * @param {string} shelfId - Shelf ID
 * @returns {Promise<Object>}
 */
export const getShelfById = async (shelfId) => {
    return formatShelfData(findShelfOrThrow(shelfId));
};

/**
 * Create a new shelf
 * @param {string} userId - User ID
 * @param {Object} shelfData - Shelf data (name, description)
 * @returns {Promise<Object>}
 */
export const createShelf = async (userId, shelfData) => {
    const parsedUserId = safeParseInt(userId, 'userId');
    const newShelf = {
        id: getNextShelfId(),
        userId: parsedUserId,
        name: shelfData.name,
        description: shelfData.description || '',
        works: [],
        createdAt: new Date(),
        updatedAt: new Date()
    };

    mockShelves.push(newShelf);
    return formatShelfData(newShelf);
};

/**
 * Update a shelf
 * @param {string} shelfId - Shelf ID
 * @param {Object} updateData - Data to update
 * @returns {Promise<Object>}
 */
export const updateShelf = async (shelfId, updateData) => {
    const shelf = findShelfOrThrow(shelfId);

    if (updateData.name !== undefined) shelf.name = updateData.name;
    if (updateData.description !== undefined) shelf.description = updateData.description;
    shelf.updatedAt = new Date();

    return formatShelfData(shelf);
};

/**
 * Delete a shelf
 * @param {string} shelfId - Shelf ID
 * @returns {Promise<boolean>}
 */
export const deleteShelf = async (shelfId) => {
    const parsedId = safeParseInt(shelfId, 'shelfId');
    const index = mockShelves.findIndex(s => s.id === parsedId);
    if (index === -1) return false;

    mockShelves.splice(index, 1);
    return true;
};

/**
 * Get all works in a shelf
 * @param {string} shelfId - Shelf ID
 * @returns {Promise<Object>}
 */
export const getShelfWorks = async (shelfId) => {
    return formatShelfData(findShelfOrThrow(shelfId));
};

/**
 * Add a work to a shelf
 * @param {string} shelfId - Shelf ID
 * @param {string} workId - Work ID
 * @returns {Promise<Object>}
 */
export const addWorkToShelf = async (shelfId, workId) => {
    const shelf = findShelfOrThrow(shelfId);
    const workIdInt = safeParseInt(workId, 'workId');

    if (!shelf.works.includes(workIdInt)) {
        shelf.works.push(workIdInt);
        shelf.updatedAt = new Date();
    }

    return formatShelfData(shelf);
};

/**
 * Remove a work from a shelf
 * @param {string} shelfId - Shelf ID
 * @param {string} workId - Work ID
 * @returns {Promise<Object>}
 */
export const removeWorkFromShelf = async (shelfId, workId) => {
    const shelf = findShelfOrThrow(shelfId);
    const workIdInt = safeParseInt(workId, 'workId');
    const index = shelf.works.indexOf(workIdInt);

    if (index > -1) {
        shelf.works.splice(index, 1);
        shelf.updatedAt = new Date();
    }

    return formatShelfData(shelf);
};
