/**
 * Input Validation Utilities
 *
 * Provides validation functions for user input, credentials, and ratings.
 * All validators return structured error objects for consistent error handling.
 * Uses constants from config/constants.js for maintainability.
 */

import { USER_CONSTRAINTS, RATING_CONSTRAINTS } from '../config/constants.js';

/**
 * Validate email address format
 *
 * Uses basic regex pattern to check for valid email structure.
 * Does NOT verify the email actually exists or is deliverable.
 * Pattern ensures: local@domain.tld with no whitespace.
 *
 * @param {string} email - Email address to validate
 * @returns {boolean} True if format is valid, false otherwise
 * @example
 * isValidEmail('user@example.com') // true
 * isValidEmail('invalid.email') // false
 * isValidEmail('user @example.com') // false (has space)
 */
export const isValidEmail = (email) => {
    // Basic pattern: anything@anything.anything with no spaces
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    return emailRegex.test(email);
};

/**
 * Validate username meets length requirements
 *
 * Checks username is present and within allowed length bounds.
 * Does NOT check for profanity, special characters, or uniqueness.
 * Length constraints prevent abuse and ensure consistent UX.
 *
 * @param {string} username - Username to validate
 * @returns {Object} Validation result
 * @returns {boolean} return.valid - Whether validation passed
 * @returns {string[]} return.errors - Array of error messages (empty if valid)
 * @example
 * validateUsername('alice') // { valid: true, errors: [] }
 * validateUsername('ab') // { valid: false, errors: ['username must be between 3 and 20 characters'] }
 * validateUsername('') // { valid: false, errors: ['username is required'] }
 */
export const validateUsername = (username) => {
    const errors = [];

    if (!username) {
        errors.push('username is required');
    } else if (username.length < USER_CONSTRAINTS.USERNAME_MIN_LENGTH ||
        username.length > USER_CONSTRAINTS.USERNAME_MAX_LENGTH) {
        errors.push(`username must be between ${USER_CONSTRAINTS.USERNAME_MIN_LENGTH} and ${USER_CONSTRAINTS.USERNAME_MAX_LENGTH} characters`);
    }

    return { valid: errors.length === 0, errors };
};

/**
 * Validate password meets minimum security requirements
 *
 * Enforces minimum length only - no complexity requirements yet.
 * Consider adding uppercase/number/symbol requirements for production.
 * Does NOT check for common passwords or user info.
 *
 * @param {string} password - Password to validate
 * @returns {Object} Validation result
 * @returns {boolean} return.valid - Whether validation passed
 * @returns {string[]} return.errors - Array of error messages (empty if valid)
 * @example
 * validatePassword('secret123') // { valid: true, errors: [] }
 * validatePassword('pass') // { valid: false, errors: ['password must be at least 6 characters long'] }
 */
export const validatePassword = (password) => {
    const errors = [];

    if (!password) {
        errors.push('password is required');
    } else if (password.length < USER_CONSTRAINTS.PASSWORD_MIN_LENGTH) {
        errors.push(`password must be at least ${USER_CONSTRAINTS.PASSWORD_MIN_LENGTH} characters long`);
    }

    return { valid: errors.length === 0, errors };
};

/**
 * Validate rating score meets system constraints
 *
 * Enforces:
 * - Score is present and numeric
 * - Score is an integer (no half-stars currently supported)
 * - Score is within MIN-MAX range (1-5)
 *
 * Rejects floats to maintain consistent rating scale.
 * Change RATING_CONSTRAINTS.STEP to allow decimals.
 *
 * @param {number} score - Rating score to validate
 * @returns {Object} Validation result
 * @returns {boolean} return.valid - Whether validation passed
 * @returns {string[]} return.errors - Array of error messages (empty if valid)
 * @example
 * validateRatingScore(4) // { valid: true, errors: [] }
 * validateRatingScore(3.5) // { valid: false, errors: ['score must be an integer (no decimals)'] }
 * validateRatingScore(6) // { valid: false, errors: ['score must be between 1 and 5'] }
 * validateRatingScore(null) // { valid: false, errors: ['score is required'] }
 */
export const validateRatingScore = (score) => {
    const errors = [];

    // Check presence first
    if (score === undefined || score === null) {
        errors.push('score is required');
    }
    // Then type
    else if (typeof score !== 'number') {
        errors.push('score must be a number');
    }
    // Then integer constraint
    else if (!Number.isInteger(score)) {
        errors.push('score must be an integer (no decimals)');
    }
    // Finally range
    else if (score < RATING_CONSTRAINTS.MIN || score > RATING_CONSTRAINTS.MAX) {
        errors.push(`score must be between ${RATING_CONSTRAINTS.MIN} and ${RATING_CONSTRAINTS.MAX}`);
    }

    return { valid: errors.length === 0, errors };
};

/**
 * Validate user registration or update data
 *
 * Validates multiple fields at once for user creation/update.
 * In update mode (isUpdate=true), all fields become optional.
 * In create mode (isUpdate=false), username/email/password are required.
 *
 * Collects all validation errors to show user complete feedback.
 * Email format validated separately from presence check.
 *
 * @param {Object} data - User data to validate
 * @param {string} [data.username] - Username field
 * @param {string} [data.email] - Email field
 * @param {string} [data.password] - Password field
 * @param {boolean} [isUpdate=false] - If true, makes all fields optional
 * @returns {Object} Validation result
 * @returns {boolean} return.valid - Whether all validations passed
 * @returns {string[]} return.errors - Array of all error messages (empty if valid)
 * @example
 * // Create mode - all fields required
 * validateUserData({ username: 'alice', email: 'alice@example.com', password: 'secret' })
 * // { valid: true, errors: [] }
 *
 * // Create mode - missing fields
 * validateUserData({ username: 'alice' })
 * // { valid: false, errors: ['password is required', 'email is required'] }
 *
 * // Update mode - fields optional
 * validateUserData({ username: 'alice' }, true)
 * // { valid: true, errors: [] }
 */
export const validateUserData = (data, isUpdate = false) => {
    const { username, email, password } = data;
    const errors = [];

    // Validate username if provided OR if creating new user
    if (username || !isUpdate) {
        const usernameValidation = validateUsername(username);
        if (!usernameValidation.valid) {
            errors.push(...usernameValidation.errors);
        }
    }

    // Validate password if provided OR if creating new user
    if (password || !isUpdate) {
        const passwordValidation = validatePassword(password);
        if (!passwordValidation.valid) {
            errors.push(...passwordValidation.errors);
        }
    }

    // Email is always required for new users
    if (!isUpdate && !email) {
        errors.push('email is required');
    }

    return { valid: errors.length === 0, errors };
};
