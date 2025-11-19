/**
 * Send success response
 * @param {Object} res - Express response object
 * @param {number} statusCode - HTTP status code
 * @param {*} data - Response data
 * @param {string} message - Success message
 */
export const sendSuccess = (res, statusCode, data, message = 'Success') => {
    res.status(statusCode).json({
        success: true,
        data,
        message
    });
};

/**
 * Send error response
 * @param {Object} res - Express response object
 * @param {number} statusCode - HTTP status code
 * @param {string} message - Error message
 * @param {*} error - Error details
 */
export const sendError = (res, statusCode, message, error = null) => {
    res.status(statusCode).json({
        success: false,
        error: error || message,
        message
    });
};
