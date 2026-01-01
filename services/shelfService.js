/**
 * @fileoverview Shelf Service
 * @description Business logic for managing user shelf collections.
 *
 * Shelves are user-created collections for organizing works (similar to playlists).
 * This service provides:
 * - CRUD operations on shelves
 * - Adding/removing works from shelves
 * - Querying shelves by user or ID
 *
 * Shelf-Work Relationship:
 * - A shelf belongs to one user
 * - A shelf can contain multiple works (stored as work ID array)
 * - Works can be in multiple shelves
 *
 * @module services/shelfService
 * @see controllers/shelfController - HTTP endpoint handler
 */

import { mockShelves, getNextShelfId } from '../data/mockShelves.js';
import { safeParseInt } from '../utils/helpers.js';

// =============================================================================
// HELPER FUNCTIONS
// =============================================================================

/**
 * Finds a mock shelf by its ID.
 *
 * @param {number|string} shelfId - Shelf ID to search for
 * @returns {Object|null} Shelf object if found, null otherwise
 */
const findMockShelfById = (shelfId) => {
    const parsedId = safeParseInt(shelfId, 'shelfId');
    return mockShelves.find(s => s.id === parsedId) || null;
};

/**
 * Formats a shelf object for API response.
 * Standardizes field names (id -> shelfId).
 *
 * @param {Object} shelf - Shelf object from mock data
 * @returns {Object} Formatted shelf with standardized field names
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

// =============================================================================
// READ OPERATIONS
// =============================================================================

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
 * @returns {Promise<Object|null>}
 */
export const getShelfById = async (shelfId) => {
    const shelf = findMockShelfById(shelfId);
    if (!shelf) return null;
    return formatShelfData(shelf);
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
 * @returns {Promise<Object|null>}
 */
export const updateShelf = async (shelfId, updateData) => {
    const shelf = findMockShelfById(shelfId);
    if (!shelf) return null;

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
 * @param {Object} filters - Filter options (workType, genre, rating, year)
 * @returns {Promise<Object|null>}
 */
export const getShelfWorks = async (shelfId) => {
    const shelf = findMockShelfById(shelfId);
    if (!shelf) return null;

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
 * Add a work to a shelf
 * @param {string} shelfId - Shelf ID
 * @param {string} workId - Work ID
 * @returns {Promise<Object|null>}
 */
export const addWorkToShelf = async (shelfId, workId) => {
    const shelf = findMockShelfById(shelfId);
    if (!shelf) return null;

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
 * @returns {Promise<Object|null>}
 */
export const removeWorkFromShelf = async (shelfId, workId) => {
    const shelf = findMockShelfById(shelfId);
    if (!shelf) return null;

    const workIdInt = safeParseInt(workId, 'workId');
    const index = shelf.works.indexOf(workIdInt);
    if (index > -1) {
        shelf.works.splice(index, 1);
        shelf.updatedAt = new Date();
    }

    return formatShelfData(shelf);
};
