import Shelf from '../models/Shelf.js';
import { mockShelves, getNextShelfId } from '../data/mockShelves.js';
import { isMongoConnected } from '../config/database.js';

/**
 * Get all shelves (across all users)
 * @returns {Promise<Array>}
 */
export const getAllShelves = async () => {
    if (isMongoConnected()) {
        const shelves = await Shelf.find().populate('works');
        return shelves.map(shelf => shelf.toJSON());
    }

    // Use mock data
    return mockShelves.map(shelf => ({
        shelfId: shelf.id,
        userId: shelf.userId,
        name: shelf.name,
        description: shelf.description,
        works: shelf.works,
        createdAt: shelf.createdAt,
        updatedAt: shelf.updatedAt
    }));
};

/**
 * Get all shelves for a user
 * @param {string} userId - User ID
 * @returns {Promise<Array>}
 */
export const getUserShelves = async (userId) => {
    if (isMongoConnected()) {
        const shelves = await Shelf.find({ userId }).populate('works');
        return shelves.map(shelf => shelf.toJSON());
    }

    // Use mock data
    return mockShelves
        .filter(shelf => shelf.userId === parseInt(userId))
        .map(shelf => ({
            shelfId: shelf.id,
            userId: shelf.userId,
            name: shelf.name,
            description: shelf.description,
            works: shelf.works,
            createdAt: shelf.createdAt,
            updatedAt: shelf.updatedAt
        }));
};

/**
 * Get a specific shelf by ID
 * @param {string} shelfId - Shelf ID
 * @returns {Promise<Object|null>}
 */
export const getShelfById = async (shelfId) => {
    if (isMongoConnected()) {
        const shelf = await Shelf.findById(shelfId).populate('works');
        if (!shelf) return null;
        return shelf.toJSON();
    }

    // Use mock data
    const shelf = mockShelves.find(s => s.id === parseInt(shelfId));
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
 * Create a new shelf
 * @param {string} userId - User ID
 * @param {Object} shelfData - Shelf data (name, description)
 * @returns {Promise<Object>}
 */
export const createShelf = async (userId, shelfData) => {
    if (isMongoConnected()) {
        const shelf = new Shelf({
            userId,
            name: shelfData.name,
            description: shelfData.description || ''
        });

        await shelf.save();
        return shelf.toJSON();
    }

    // Use mock data
    const newShelf = {
        id: getNextShelfId(),
        userId: parseInt(userId),
        name: shelfData.name,
        description: shelfData.description || '',
        works: [],
        createdAt: new Date(),
        updatedAt: new Date()
    };

    mockShelves.push(newShelf);

    return {
        shelfId: newShelf.id,
        userId: newShelf.userId,
        name: newShelf.name,
        description: newShelf.description,
        works: newShelf.works,
        createdAt: newShelf.createdAt,
        updatedAt: newShelf.updatedAt
    };
};

/**
 * Update a shelf
 * @param {string} shelfId - Shelf ID
 * @param {Object} updateData - Data to update
 * @returns {Promise<Object|null>}
 */
export const updateShelf = async (shelfId, updateData) => {
    if (isMongoConnected()) {
        const shelf = await Shelf.findByIdAndUpdate(
            shelfId,
            { $set: updateData },
            { new: true, runValidators: true }
        ).populate('works');

        if (!shelf) return null;
        return shelf.toJSON();
    }

    // Use mock data
    const shelf = mockShelves.find(s => s.id === parseInt(shelfId));
    if (!shelf) return null;

    if (updateData.name !== undefined) shelf.name = updateData.name;
    if (updateData.description !== undefined) shelf.description = updateData.description;
    shelf.updatedAt = new Date();

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
 * Delete a shelf
 * @param {string} shelfId - Shelf ID
 * @returns {Promise<boolean>}
 */
export const deleteShelf = async (shelfId) => {
    if (isMongoConnected()) {
        const result = await Shelf.findByIdAndDelete(shelfId);
        return result !== null;
    }

    // Use mock data
    const index = mockShelves.findIndex(s => s.id === parseInt(shelfId));
    if (index === -1) return false;

    mockShelves.splice(index, 1);
    return true;
};

/**
 * Get all works in a shelf with optional filtering
 * @param {string} shelfId - Shelf ID
 * @param {Object} filters - Filter options (workType, genre, rating, year)
 * @returns {Promise<Object|null>}
 */
export const getShelfWorks = async (shelfId, filters = {}) => {
    if (isMongoConnected()) {
        const shelf = await Shelf.findById(shelfId).populate({
            path: 'works',
            match: buildMongoQuery(filters)
        });

        if (!shelf) return null;
        return shelf.toJSON();
    }

    // Use mock data - we need to import mockWorks
    const shelf = mockShelves.find(s => s.id === parseInt(shelfId));
    if (!shelf) return null;

    const works = shelf.works; // In mock, works are just IDs
    return {
        shelfId: shelf.id,
        userId: shelf.userId,
        name: shelf.name,
        description: shelf.description,
        works: works,
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
    if (isMongoConnected()) {
        const shelf = await Shelf.findByIdAndUpdate(
            shelfId,
            { $addToSet: { works: workId } },
            { new: true }
        ).populate('works');

        if (!shelf) return null;
        return shelf.toJSON();
    }

    // Use mock data
    const shelf = mockShelves.find(s => s.id === parseInt(shelfId));
    if (!shelf) return null;

    const workIdInt = parseInt(workId);
    if (!shelf.works.includes(workIdInt)) {
        shelf.works.push(workIdInt);
        shelf.updatedAt = new Date();
    }

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
 * Remove a work from a shelf
 * @param {string} shelfId - Shelf ID
 * @param {string} workId - Work ID
 * @returns {Promise<Object|null>}
 */
export const removeWorkFromShelf = async (shelfId, workId) => {
    if (isMongoConnected()) {
        const shelf = await Shelf.findByIdAndUpdate(
            shelfId,
            { $pull: { works: workId } },
            { new: true }
        ).populate('works');

        if (!shelf) return null;
        return shelf.toJSON();
    }

    // Use mock data
    const shelf = mockShelves.find(s => s.id === parseInt(shelfId));
    if (!shelf) return null;

    const workIdInt = parseInt(workId);
    const index = shelf.works.indexOf(workIdInt);
    if (index > -1) {
        shelf.works.splice(index, 1);
        shelf.updatedAt = new Date();
    }

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
 * Helper function to build MongoDB query from filters
 */
function buildMongoQuery(filters) {
    const query = {};

    if (filters['work-type']) {
        query.type = filters['work-type'];
    }

    if (filters.genre) {
        query.genres = filters.genre;
    }

    if (filters.year) {
        query.year = parseInt(filters.year);
    }

    if (filters.rating) {
        // This would need to be implemented with aggregation in a real scenario
        // For now, we'll handle it at the application level
    }

    return query;
}
