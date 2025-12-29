import { HTTP_STATUS } from '../config/constants.js';
import { sendError } from '../utils/responses.js';
import { prodError } from '../utils/logger.js';

/**
 * Global error handling middleware
 * @param {Error} err - Error object
 * @param {Object} req - Express request object
 * @param {Object} res - Express response object
 * @param {Function} next - Express next middleware function
 */
export const errorHandler = (err, _req, res, next) => {
    prodError('Error:', err);

    // Mongoose validation error
    if (err.name === 'ValidationError') {
        const errors = Object.values(err.errors).map(e => e.message);
        return sendError(res, HTTP_STATUS.BAD_REQUEST, 'Validation error', errors);
    }

    // Mongoose duplicate key error
    if (err.code === 11000) {
        const field = Object.keys(err.keyPattern)[0];
        return sendError(res, HTTP_STATUS.BAD_REQUEST, `${field} already exists`);
    }

    // Mongoose cast error
    if (err.name === 'CastError') {
        return sendError(res, HTTP_STATUS.BAD_REQUEST, 'Invalid ID format');
    }

    // JWT errors
    if (err.name === 'JsonWebTokenError') {
        return sendError(res, HTTP_STATUS.UNAUTHORIZED, 'Invalid token');
    }

    if (err.name === 'TokenExpiredError') {
        return sendError(res, HTTP_STATUS.UNAUTHORIZED, 'Token expired');
    }

    // Default to 500 server error
    sendError(res, HTTP_STATUS.INTERNAL_SERVER_ERROR, 'Internal server error', err.message);
};

/**
 * 404 Not Found handler
 * @param {Object} req - Express request object
 * @param {Object} res - Express response object
 */
export const notFoundHandler = (req, res) => {
    sendError(res, HTTP_STATUS.NOT_FOUND, `Route ${req.originalUrl} not found`);
};
