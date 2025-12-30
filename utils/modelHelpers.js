/**
 * Standard toJSON transform function for Mongoose models
 * Converts _id to a custom ID field and removes MongoDB internals
 * @param {string} idField - Name of the ID field (e.g., 'userId', 'workId')
 * @param {Array<string>} fieldsToDelete - Additional fields to remove (e.g., ['password'])
 * @returns {Function} Transform function for toJSON
 */
export const createToJSONTransform = (idField, fieldsToDelete = []) => {
    // eslint-disable-next-line no-unused-vars
    return function (_doc, ret) {
        // Rename _id to custom field
        ret[idField] = ret._id;
        delete ret._id;
        delete ret.__v;

        // Delete additional fields
        fieldsToDelete.forEach(field => {
            delete ret[field];
        });

        return ret;
    };
};

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
