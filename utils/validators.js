import { USER_CONSTRAINTS, RATING_CONSTRAINTS } from '../config/constants.js';

/**
 * Validate email format
 * @param {string} email - Email to validate
 * @returns {boolean}
 */
export const isValidEmail = (email) => {
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    return emailRegex.test(email);
};

/**
 * Validate username
 * @param {string} username - Username to validate
 * @returns {Object} - { valid: boolean, errors: string[] }
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
 * Validate password
 * @param {string} password - Password to validate
 * @returns {Object} - { valid: boolean, errors: string[] }
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
 * Validate rating score
 * @param {number} score - Rating score to validate
 * @returns {Object} - { valid: boolean, errors: string[] }
 */
export const validateRatingScore = (score) => {
    const errors = [];

    if (score === undefined || score === null) {
        errors.push('score is required');
    } else if (typeof score !== 'number') {
        errors.push('score must be a number');
    } else if (!Number.isInteger(score)) {
        errors.push('score must be an integer (no decimals)');
    } else if (score < RATING_CONSTRAINTS.MIN || score > RATING_CONSTRAINTS.MAX) {
        errors.push(`score must be between ${RATING_CONSTRAINTS.MIN} and ${RATING_CONSTRAINTS.MAX}`);
    }

    return { valid: errors.length === 0, errors };
};

/**
 * Validate user registration/update data
 * @param {Object} data - User data to validate
 * @param {boolean} isUpdate - Whether this is an update (makes fields optional)
 * @returns {Object} - { valid: boolean, errors: string[] }
 */
export const validateUserData = (data, isUpdate = false) => {
    const { username, email, password } = data;
    const errors = [];

    // Validate username if provided or required
    if (username || !isUpdate) {
        const usernameValidation = validateUsername(username);
        if (!usernameValidation.valid) {
            errors.push(...usernameValidation.errors);
        }
    }

    // Validate password if provided or required
    if (password || !isUpdate) {
        const passwordValidation = validatePassword(password);
        if (!passwordValidation.valid) {
            errors.push(...passwordValidation.errors);
        }
    }

    // Validate email if provided or required
    if (!isUpdate && !email) {
        errors.push('email is required');
    }

    return { valid: errors.length === 0, errors };
};
