import { HTTP_STATUS } from '../config/constants.js';
import { sendError } from '../utils/responses.js';

/**
 * Validate request body has required fields
 * @param {Array} requiredFields - Array of required field names
 * @returns {Function} Express middleware function
 */
export const validateRequiredFields = (requiredFields) => {
    return (req, res, next) => {
        const errors = [];

        for (const field of requiredFields) {
            if (req.body[field] === undefined || req.body[field] === null || req.body[field] === '') {
                errors.push(`${field} is required`);
            }
        }

        if (errors.length > 0) {
            return sendError(res, HTTP_STATUS.BAD_REQUEST, 'Invalid input', errors);
        }

        next();
    };
};

/**
 * Validate ID parameter is a valid integer (read-only, doesn't mutate)
 * @param {string} paramName - Name of the parameter
 * @returns {Function} Express middleware function
 */
export const validateIdParam = (paramName) => {
    return (req, res, next) => {
        const id = req.params[paramName];
        const parsedId = parseInt(id, 10);

        if (isNaN(parsedId) || parsedId <= 0) {
            return sendError(res, HTTP_STATUS.BAD_REQUEST, `Invalid ${paramName}: must be a positive integer`);
        }

        // Don't mutate params - let services handle parsing
        // This keeps validation pure and avoids type inconsistencies
        next();
    };
};
