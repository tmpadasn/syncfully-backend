/**
 * @fileoverview Logging Utilities
 * @description Environment-aware logging functions for development and production.
 *
 * This module provides logging wrappers that respect the NODE_ENV setting:
 * - dev* functions: Only log in development mode (silent in production)
 * - prod* functions: Always log (for critical production messages)
 *
 * Environment Modes:
 * - development (default): Full logging enabled
 * - production: Only prod* functions output logs
 *
 * Usage:
 * - devLog('Debug info', data);     // Development only
 * - devError('Debug error', err);   // Development only  
 * - prodLog('Server started');      // Always logs
 * - prodError('Fatal error', err);  // Always logs
 *
 * @module utils/logger
 */

// =============================================================================
// ENVIRONMENT DETECTION
// =============================================================================

/**
 * Checks if the application is running in development mode.
 * Default is 'development' if NODE_ENV is not set.
 *
 * @returns {boolean} True if in development mode
 */
const isDevelopment = () => (process.env.NODE_ENV || 'development') !== 'production';

// =============================================================================
// DEVELOPMENT LOGGING (Silent in production)
// =============================================================================

/**
 * Log message in development mode only
 * @param {...any} args - Arguments to log
 */
export const devLog = (...args) => {
    if (isDevelopment()) {
        console.log(...args);
    }
};

/**
 * Log error in development mode only
 * @param {...any} args - Arguments to log
 */
export const devError = (...args) => {
    if (isDevelopment()) {
        console.error(...args);
    }
};

/**
 * Log warning in development mode only
 * @param {...any} args - Arguments to log
 */
export const devWarn = (...args) => {
    if (isDevelopment()) {
        console.warn(...args);
    }
};

/**
 * Log info in development mode only
 * @param {...any} args - Arguments to log
 */
export const devInfo = (...args) => {
    if (isDevelopment()) {
        console.info(...args);
    }
};

/**
 * Always log (regardless of environment)
 * Use for critical production logs
 * @param {...any} args - Arguments to log
 */
export const prodLog = (...args) => {
    console.log(...args);
};

/**
 * Always log errors (regardless of environment)
 * Use for critical production errors
 * @param {...any} args - Arguments to log
 */
export const prodError = (...args) => {
    console.error(...args);
};
