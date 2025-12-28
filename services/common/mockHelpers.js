import { safeParseInt } from '../../utils/helpers.js';

/**
 * Generic helper to find an item by ID in a mock array
 * @param {Array} mockArray - Array of mock items
 * @param {number|string} id - Item ID
 * @param {string} idField - Name of the ID field (default: 'id')
 * @returns {Object|null} Found item or null
 */
export const findMockById = (mockArray, id, idField = 'id') => {
    const parsedId = safeParseInt(id, idField);
    return mockArray.find(item => item[idField] === parsedId) || null;
};

/**
 * Generic helper to find index of an item by ID in a mock array
 * @param {Array} mockArray - Array of mock items
 * @param {number|string} id - Item ID
 * @param {string} idField - Name of the ID field (default: 'id')
 * @returns {number} Index of item or -1 if not found
 */
export const findMockIndexById = (mockArray, id, idField = 'id') => {
    const parsedId = safeParseInt(id, idField);
    return mockArray.findIndex(item => item[idField] === parsedId);
};

/**
 * Generic helper to delete an item from a mock array by ID
 * @param {Array} mockArray - Array of mock items
 * @param {number|string} id - Item ID
 * @param {string} idField - Name of the ID field (default: 'id')
 * @returns {boolean} True if deleted, false if not found
 */
export const deleteMockById = (mockArray, id, idField = 'id') => {
    const index = findMockIndexById(mockArray, id, idField);
    if (index === -1) return false;
    mockArray.splice(index, 1);
    return true;
};
