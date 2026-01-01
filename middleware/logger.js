/**
 * @fileoverview Request Logger Middleware
 * @description HTTP request logging middleware for debugging and monitoring.
 *
 * Logs each request with:
 * - HTTP method (GET, POST, PUT, DELETE, etc.)
 * - Request URL/path
 * - Response status code
 * - Request duration in milliseconds
 *
 * Timing starts when request arrives and ends when response is sent.
 * Uses res.on('finish') to capture final status after all processing.
 *
 * Example output: "GET /api/users 200 - 45ms"
 *
 * @module middleware/logger
 * @see utils/logger - Production logging utilities
 */

/**
 * Request Logger Middleware
 *
 * Attaches timing to each request and logs completion details.
 * Non-blocking: logs asynchronously after response is sent.
 *
 * @param {Object} req - Express request object
 * @param {Object} res - Express response object
 * @param {Function} next - Express next middleware function
 *
 * @example
 * // Apply to all routes in app.js:
 * app.use(logger);
 */
export const logger = (req, res, next) => {
    // Capture request start time for duration calculation
    const start = Date.now();

    // Listen for response completion event
    // 'finish' fires after response headers and body are sent
    res.on('finish', () => {
        // Calculate total request processing time
        const duration = Date.now() - start;

        // Format: METHOD /path STATUS - DURATIONms
        const logMessage = `${req.method} ${req.originalUrl} ${res.statusCode} - ${duration}ms`;
        console.log(logMessage);
    });

    // Continue to next middleware (non-blocking)
    next();
};
