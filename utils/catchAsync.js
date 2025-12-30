/**
 * Wraps an async function and passes any errors to the next middleware.
 * This removes the need for try-catch blocks in every controller method.
 *
 * @param {Function} fn - The async function to wrap
 * @returns {Function} A new function that handles the error automatically
 */
export const catchAsync = (fn) => (req, res, next) => {
    Promise.resolve(fn(req, res, next)).catch(next);
};

export default catchAsync;
