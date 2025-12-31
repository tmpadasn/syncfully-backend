/**
 * Input Validation Utilities
 * Provides validation functions for user input, credentials, and ratings.
 */

import { USER_CONSTRAINTS, RATING_CONSTRAINTS } from '../config/constants.js';

/**
 * Validate email address format using basic regex
 * @param {string} email - Email address to validate
 * @returns {boolean} True if format is valid
 */
export const isValidEmail = (email) => {
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    return emailRegex.test(email);
};

/**
 * Validate username length requirements
 * @param {string} username - Username to validate
 * @returns {Object} Validation result with `valid` boolean and `errors` array
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
 * Validate password minimum length requirement
 * @param {string} password - Password to validate
 * @returns {Object} Validation result with `valid` boolean and `errors` array
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
 * Validate rating score (must be integer between MIN-MAX range)
 * @param {number} score - Rating score to validate
 * @returns {Object} Validation result with `valid` boolean and `errors` array
 */
export const validateRatingScore = (score) => {
    const errors = [];

    if (score === undefined || score === null) {
        errors.push('score is required');
    }
    else if (typeof score !== 'number') {
        errors.push('score must be a number');
    }
    else if (!Number.isInteger(score)) {
        errors.push('score must be an integer (no decimals)');
    }
    else if (score < RATING_CONSTRAINTS.MIN || score > RATING_CONSTRAINTS.MAX) {
        errors.push(`score must be between ${RATING_CONSTRAINTS.MIN} and ${RATING_CONSTRAINTS.MAX}`);
    }

    return { valid: errors.length === 0, errors };
};

/**
 * Validate user registration or update data
 * In update mode (isUpdate=true), all fields become optional
 * @param {Object} data - User data to validate
 * @param {boolean} [isUpdate=false] - If true, makes all fields optional
 * @returns {Object} Validation result with `valid` boolean and `errors` array
 */
export const validateUserData = (data, isUpdate = false) => {
    const { username, email, password } = data;
    const errors = [];

    if (username || !isUpdate) {
        const usernameValidation = validateUsername(username);
        if (!usernameValidation.valid) {
            errors.push(...usernameValidation.errors);
        }
    }

    if (password || !isUpdate) {
        const passwordValidation = validatePassword(password);
        if (!passwordValidation.valid) {
            errors.push(...passwordValidation.errors);
        }
    }

    if (!isUpdate && !email) {
        errors.push('email is required');
    }

    return { valid: errors.length === 0, errors };
};
