/**
 * Application Constants
 *
 * Central configuration for application-wide constants.
 * Modify these values to change system behavior without touching business logic.
 */

/**
 * Supported work types across the platform
 *
 * These define the types of media that can be tracked and rated.
 * Values must match database schemas and frontend expectations.
 *
 * @constant {Object}
 */
export const WORK_TYPES = {
    MOVIE: 'movie',
    SERIES: 'series',
    MUSIC: 'music',
    BOOK: 'book',
    GRAPHIC_NOVEL: 'graphic-novel'
};

/**
 * Base URL for serving uploaded images
 *
 * Configurable via IMAGE_BASE_URL environment variable.
 * Used to construct full URLs for profile pictures and media covers.
 * Falls back to localhost for development environments.
 *
 * @constant {string}
 * @example
 * // In production: https://cdn.example.com/uploads
 * // In development: http://localhost:3000/uploads
 */
export const IMAGE_BASE_URL = process.env.IMAGE_BASE_URL || 'http://localhost:3000/uploads';

/**
 * Rating system constraints
 *
 * Enforces consistent rating behavior across the application.
 * MIN and MAX define the allowed range (1-5 stars).
 * STEP ensures only whole numbers are accepted (no half-stars).
 *
 * @constant {Object}
 * @property {number} MIN - Minimum allowed rating value
 * @property {number} MAX - Maximum allowed rating value
 * @property {number} STEP - Rating increment (1 = integers only)
 */
export const RATING_CONSTRAINTS = {
    MIN: 1,
    MAX: 5,
    STEP: 1  // Only integer ratings allowed (no 3.5 stars)
};

/**
 * User input validation constraints
 *
 * Defines minimum/maximum lengths for user-provided data.
 * Prevents abuse and ensures consistent data quality.
 *
 * @constant {Object}
 * @property {number} USERNAME_MIN_LENGTH - Prevents single-character usernames
 * @property {number} USERNAME_MAX_LENGTH - Keeps usernames readable and storable
 * @property {number} PASSWORD_MIN_LENGTH - Basic security requirement
 */
export const USER_CONSTRAINTS = {
    USERNAME_MIN_LENGTH: 3,
    USERNAME_MAX_LENGTH: 20,
    PASSWORD_MIN_LENGTH: 6
};

/**
 * Query result limits for expensive operations
 *
 * Controls the number of results returned by various queries.
 * Prevents performance degradation from unbounded result sets.
 *
 * @constant {Object}
 * @property {number} SIMILAR_WORKS - Max similar works per recommendation query
 * @property {number} POPULAR_WORKS - Max popular works returned to client
 * @property {number} POPULAR_WORKS_FETCH - Internal fetch limit for sorting
 *   Fetches more than needed to allow sorting by rating before truncating
 */
export const QUERY_LIMITS = {
    SIMILAR_WORKS: 10,
    POPULAR_WORKS: 10,
    POPULAR_WORKS_FETCH: 50  // Fetch 50, sort by rating, return top 10
};

/**
 * HTTP status codes
 *
 * Standardized status codes used throughout the API.
 * Provides semantic meaning for API responses.
 *
 * @constant {Object}
 * @property {number} OK - Successful GET/PUT/PATCH
 * @property {number} CREATED - Successful POST with resource creation
 * @property {number} NO_CONTENT - Successful DELETE
 * @property {number} BAD_REQUEST - Invalid client input
 * @property {number} UNAUTHORIZED - Authentication required or failed
 * @property {number} NOT_FOUND - Resource does not exist
 * @property {number} INTERNAL_SERVER_ERROR - Unexpected server error
 */
export const HTTP_STATUS = {
    OK: 200,
    CREATED: 201,
    NO_CONTENT: 204,
    BAD_REQUEST: 400,
    UNAUTHORIZED: 401,
    NOT_FOUND: 404,
    INTERNAL_SERVER_ERROR: 500
};

/**
 * Supported content genres
 *
 * Standardized genre list used for filtering and categorization.
 * Applies across all work types (movies, books, music, etc.).
 * Maintain alphabetical order for consistency.
 *
 * @constant {string[]}
 * @example
 * // Filter works by genre
 * const actionMovies = works.filter(w => w.genres.includes('Action'));
 */
export const GENRES = [
    'Action',
    'Adventure',
    'Animation',
    'Biography',
    'Comedy',
    'Crime',
    'Documentary',
    'Drama',
    'Fantasy',
    'History',
    'Horror',
    'Mystery',
    'Romance',
    'Sci-Fi',
    'Thriller'
];
