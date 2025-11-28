/**
 * Development logger utility
 * Only logs in development mode (NODE_ENV !== 'production')
 */

const isDevelopment = () => (process.env.NODE_ENV || 'development') !== 'production';

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
