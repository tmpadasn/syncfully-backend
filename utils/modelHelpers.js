/**
 * @fileoverview Mongoose Model Helpers
 * @description Utility functions for Mongoose schema configuration.
 *
 * These helpers standardize JSON serialization behavior across Mongoose models.
 * Key features:
 * - Rename MongoDB's _id to custom field names (userId, workId, etc.)
 * - Remove internal fields (__v) from JSON output
 * - Optionally remove sensitive fields (passwords)
 * - Include virtual properties in JSON when needed
 *
 * Usage:
 * Apply these helpers in schema toJSON options for consistent API responses.
 *
 * @module utils/modelHelpers
 * @see models/* - Mongoose model definitions
 */

// =============================================================================
// JSON TRANSFORMATION HELPERS
// =============================================================================

/**
 * Creates a toJSON transform function for Mongoose models.
 * Renames _id to a custom field name and removes specified fields.
 *
 * @param {string} idField - Name for the ID field in JSON (e.g., 'userId', 'workId')
 * @param {Array<string>} fieldsToDelete - Fields to remove from JSON (e.g., ['password'])
 * @returns {Function} Transform function for toJSON option
 *
 * @example
 * // In schema definition:
 * const userSchema = new Schema({...}, {
 *   toJSON: { transform: createToJSONTransform('userId', ['password']) }
 * });
 */
export const createToJSONTransform = (idField, fieldsToDelete = []) => {
    // eslint-disable-next-line no-unused-vars
    return function (_doc, ret) {
        // Rename _id to custom field
        ret[idField] = ret._id;
        delete ret._id;
        delete ret.__v;  // Always remove Mongoose version key

        // Delete additional fields (e.g., password)
        fieldsToDelete.forEach(field => {
            delete ret[field];
        });

        return ret;
    };
};

// =============================================================================
// JSON OPTIONS BUILDER
// =============================================================================

/**
 * Standard toJSON options with ID transformation
 * @param {string} idField - Name of the ID field
 * @param {Array<string>} fieldsToDelete - Fields to remove
 * @param {boolean} includeVirtuals - Whether to include virtual properties
 * @returns {Object} toJSON options object
 */
export const createToJSONOptions = (idField, fieldsToDelete = [], includeVirtuals = false) => {
    const options = {
        transform: createToJSONTransform(idField, fieldsToDelete)
    };

    if (includeVirtuals) {
        options.virtuals = true;
    }

    return options;
};
