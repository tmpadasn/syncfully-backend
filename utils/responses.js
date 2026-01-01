/**
 * @fileoverview API Response Utilities
 * @description Standardized response helpers for Express routes.
 *
 * These utilities ensure consistent API response format across all endpoints.
 * All responses follow the structure:
 * {
 *   success: boolean,      // Whether the request succeeded
 *   data: any,             // Response payload (for success)
 *   error: any,            // Error details (for failure)
 *   message: string        // Human-readable message
 * }
 *
 * Usage:
 * - sendSuccess(res, 200, { user: {...} }, 'User retrieved');
 * - sendError(res, 404, 'User not found', ['userId is invalid']);
 *
 * @module utils/responses
 * @see controllers/* - All controllers use these helpers
 */

// =============================================================================
// SUCCESS RESPONSES
// =============================================================================

/**
 * Sends a standardized success response.
 *
 * @param {Object} res - Express response object
 * @param {number} statusCode - HTTP status code (2xx)
 * @param {*} data - Response payload to send
 * @param {string} [message='Success'] - Human-readable success message
 *
 * @example
 * sendSuccess(res, 200, { userId: 1, username: 'alice' }, 'User found');
 * // Response: { success: true, data: {...}, message: 'User found' }
 */
export const sendSuccess = (res, statusCode, data, message = 'Success') => {
    res.status(statusCode).json({
        success: true,
        data,
        message
    });
};

// =============================================================================
// ERROR RESPONSES
// =============================================================================

/**
 * Sends a standardized error response.
 *
 * @param {Object} res - Express response object
 * @param {number} statusCode - HTTP status code (4xx, 5xx)
 * @param {string} message - Human-readable error message
 * @param {*} [error=null] - Additional error details (array of messages, object, etc.)
 *
 * @example
 * sendError(res, 400, 'Invalid input', ['username is required', 'email is invalid']);
 * // Response: { success: false, error: [...], message: 'Invalid input' }
 */
export const sendError = (res, statusCode, message, error = null) => {
    res.status(statusCode).json({
        success: false,
        error: error || message,  // Default to message if no detailed error
        message
    });
};
