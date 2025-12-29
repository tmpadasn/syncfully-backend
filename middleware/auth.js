import { HTTP_STATUS } from '../config/constants.js';
import { sendError } from '../utils/responses.js';

/**
 * Basic authentication middleware (placeholder for future JWT implementation)
 * @param {Object} req - Express request object
 * @param {Object} res - Express response object
 * @param {Function} next - Express next middleware function
 */
// eslint-disable-next-line no-unused-vars
export const authenticate = (_req, _res, next) => {
    // For now, we'll allow all requests
    // In production, implement JWT verification here
    next();
};

/**
 * Validate request has required authentication header
 * @param {Object} req - Express request object
 * @param {Object} res - Express response object
 * @param {Function} next - Express next middleware function
 */
export const requireAuth = (req, res, next) => {
    const authHeader = req.headers.authorization;

    if (!authHeader) {
        return sendError(res, HTTP_STATUS.UNAUTHORIZED, 'No authorization header provided');
    }

    // Basic validation - in production, verify JWT token
    next();
};
