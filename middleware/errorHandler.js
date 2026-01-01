import { HTTP_STATUS } from '../config/constants.js';
import { sendError } from '../utils/responses.js';
import { prodError } from '../utils/logger.js';

// Error handler map for different error types
const errorHandlers = {
    NotFoundError: (err, res) => sendError(res, err.statusCode, err.message),
    ValidationError: (err, res) => {
        const errorField = err.errors?.length > 0 ? err.errors : undefined;
        return sendError(res, err.statusCode, err.message, errorField);
    },
    UserExistsError: (err, res) => sendError(res, err.statusCode, err.message),
    AuthenticationError: (err, res) => sendError(res, err.statusCode, err.message),
    JsonWebTokenError: (_err, res) => sendError(res, HTTP_STATUS.UNAUTHORIZED, 'Invalid token'),
    TokenExpiredError: (_err, res) => sendError(res, HTTP_STATUS.UNAUTHORIZED, 'Token expired')
};

/**
 * Global error handling middleware
 */
// eslint-disable-next-line no-unused-vars
export const errorHandler = (err, _req, res, next) => {
    prodError('Error:', err);

    const handler = errorHandlers[err.constructor.name] || errorHandlers[err.name];
    if (handler) return handler(err, res);

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
