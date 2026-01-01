/**
 * @fileoverview Validation Middleware
 * @description Express middleware for validating request data.
 *
 * Provides reusable validation middleware factory functions that generate
 * middleware for specific validation needs. These are used in route
 * definitions to validate requests before they reach controllers.
 *
 * Available Validators:
 * - validateRequiredFields: Ensures required body fields are present
 * - validateIdParam: Validates URL parameter is a positive integer
 *
 * Validation Strategy:
 * Middleware validates and rejects early. Controllers receive only
 * validated requests, reducing boilerplate and ensuring consistency.
 *
 * @module middleware/validation
 * @see config/constants - HTTP status codes
 * @see utils/responses - Error response formatting
 */

import { HTTP_STATUS } from '../config/constants.js';
import { sendError } from '../utils/responses.js';

// ============================================================================
// BODY VALIDATION
// ============================================================================

/**
 * Factory: Validate Required Fields Middleware
 *
 * Creates middleware that checks if specified fields exist in request body.
 * Empty strings, null, and undefined are all considered missing.
 *
 * @param {string[]} requiredFields - Array of field names that must be present
 * @returns {Function} Express middleware function
 *
 * @example
 * // Require username and password for login:
 * router.post('/login', validateRequiredFields(['username', 'password']), login);
 *
 * @example
 * // Error response when fields missing:
 * // { success: false, message: "Invalid input", errors: ["email is required"] }
 */
export const validateRequiredFields = (requiredFields) => {
    return (req, res, next) => {
        // Collect all missing/empty fields
        const errors = [];

        for (const field of requiredFields) {
            // Check for undefined, null, or empty string
            if (req.body[field] === undefined || req.body[field] === null || req.body[field] === '') {
                errors.push(`${field} is required`);
            }
        }

        // Reject if any required fields are missing
        if (errors.length > 0) {
            return sendError(res, HTTP_STATUS.BAD_REQUEST, 'Invalid input', errors);
        }

        // All required fields present - continue to next middleware
        next();
    };
};

// ============================================================================
// PARAMETER VALIDATION
// ============================================================================

/**
 * Factory: Validate ID Parameter Middleware
 *
 * Creates middleware that validates a URL parameter is a positive integer.
 * Used for validating resource IDs in RESTful routes (e.g., /users/:userId).
 *
 * Note: This middleware is read-only - it validates but does not mutate
 * req.params. The service layer handles parsing to maintain type consistency.
 *
 * @param {string} paramName - Name of the URL parameter to validate
 * @returns {Function} Express middleware function
 *
 * @example
 * // Validate userId in route:
 * router.get('/:userId', validateIdParam('userId'), getUserById);
 *
 * @example
 * // Validate multiple IDs in route:
 * router.post('/:userId/follow/:targetId',
 *   validateIdParam('userId'),
 *   validateIdParam('targetId'),
 *   followUser
 * );
 */
export const validateIdParam = (paramName) => {
    return (req, res, next) => {
        // Extract parameter value from URL
        const id = req.params[paramName];

        // Parse as base-10 integer
        const parsedId = parseInt(id, 10);

        // Validate: must be a positive integer
        if (isNaN(parsedId) || parsedId <= 0) {
            return sendError(res, HTTP_STATUS.BAD_REQUEST, `Invalid ${paramName}: must be a positive integer`);
        }

        // Valid ID - continue to next middleware
        // Note: We don't mutate params here to keep validation pure
        // and avoid type inconsistencies. Services parse IDs as needed.
        next();
    };
};

