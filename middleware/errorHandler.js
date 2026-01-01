/**
 * @fileoverview Global Error Handler Middleware
 * @description Centralized error handling for the Express application.
 *
 * This middleware catches all errors thrown/passed via next(error) and
 * sends appropriate HTTP responses. It handles:
 * - Mongoose validation errors (field-level validation failures)
 * - MongoDB duplicate key errors (unique constraint violations)
 * - Mongoose cast errors (invalid ObjectId format)
 * - JWT authentication errors (invalid or expired tokens)
 * - Generic errors (fallback to 500 Internal Server Error)
 *
 * Usage:
 * This middleware must be registered LAST in the middleware chain,
 * after all routes, to catch errors from any handler.
 *
 * Error Flow:
 *   Controller throws error → Express catches → errorHandler formats response
 *
 * @module middleware/errorHandler
 * @see config/constants - HTTP status codes
 * @see utils/responses - Response formatting utilities
 */

import { HTTP_STATUS } from '../config/constants.js';
import { sendError } from '../utils/responses.js';
import { prodError } from '../utils/logger.js';

// ============================================================================
// GLOBAL ERROR HANDLER
// ============================================================================

/**
 * Global Error Handler Middleware
 *
 * Express error middleware (4 parameters required for Express to recognize it).
 * Logs all errors and sends formatted error responses to clients.
 *
 * Error Types Handled:
 * 1. ValidationError - Mongoose schema validation failures
 * 2. Code 11000 - MongoDB duplicate key (unique constraint) violations
 * 3. CastError - Invalid MongoDB ObjectId format
 * 4. JsonWebTokenError - Invalid JWT signature or format
 * 5. TokenExpiredError - JWT token has expired
 *
 * @param {Error} err - Error object passed from previous middleware
 * @param {Object} _req - Express request object (unused)
 * @param {Object} res - Express response object
 * @param {Function} next - Express next function (unused but required for signature)
 */
// eslint-disable-next-line no-unused-vars
export const errorHandler = (err, _req, res, next) => {
    // Log error for debugging and monitoring
    prodError('Error:', err);

    // ────────────────────────────────────────────────────────────────────
    // Mongoose Validation Error
    // Occurs when document fails schema validation (e.g., required field missing)
    // ────────────────────────────────────────────────────────────────────
    if (err.name === 'ValidationError') {
        // Extract all validation error messages
        const errors = Object.values(err.errors).map(e => e.message);
        return sendError(res, HTTP_STATUS.BAD_REQUEST, 'Validation error', errors);
    }

    // ────────────────────────────────────────────────────────────────────
    // MongoDB Duplicate Key Error
    // Occurs when inserting document violates unique index constraint
    // Error code 11000 is MongoDB's duplicate key error
    // ────────────────────────────────────────────────────────────────────
    if (err.code === 11000) {
        // Extract the field that caused the duplicate (e.g., 'email', 'username')
        const field = Object.keys(err.keyPattern)[0];
        return sendError(res, HTTP_STATUS.BAD_REQUEST, `${field} already exists`);
    }

    // ────────────────────────────────────────────────────────────────────
    // Mongoose Cast Error
    // Occurs when value cannot be cast to schema type (e.g., invalid ObjectId)
    // Common when URL parameter isn't a valid MongoDB ID format
    // ────────────────────────────────────────────────────────────────────
    if (err.name === 'CastError') {
        return sendError(res, HTTP_STATUS.BAD_REQUEST, 'Invalid ID format');
    }

    // ────────────────────────────────────────────────────────────────────
    // JWT Invalid Token Error
    // Occurs when JWT signature verification fails or token is malformed
    // ────────────────────────────────────────────────────────────────────
    if (err.name === 'JsonWebTokenError') {
        return sendError(res, HTTP_STATUS.UNAUTHORIZED, 'Invalid token');
    }

    // ────────────────────────────────────────────────────────────────────
    // JWT Expired Token Error
    // Occurs when JWT token is valid but has passed its expiration time
    // ────────────────────────────────────────────────────────────────────
    if (err.name === 'TokenExpiredError') {
        return sendError(res, HTTP_STATUS.UNAUTHORIZED, 'Token expired');
    }

    // ────────────────────────────────────────────────────────────────────
    // Generic Error Fallback
    // Catches all other errors - returns 500 Internal Server Error
    // ────────────────────────────────────────────────────────────────────
    sendError(res, HTTP_STATUS.INTERNAL_SERVER_ERROR, 'Internal server error', err.message);
};

// ============================================================================
// 404 NOT FOUND HANDLER
// ============================================================================

/**
 * 404 Not Found Handler
 *
 * Handles requests to undefined routes.
 * Should be registered after all route definitions but before errorHandler.
 *
 * @param {Object} req - Express request object
 * @param {Object} res - Express response object
 */
export const notFoundHandler = (req, res) => {
    sendError(res, HTTP_STATUS.NOT_FOUND, `Route ${req.originalUrl} not found`);
};

