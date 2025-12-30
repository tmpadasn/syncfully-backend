/**
 * @fileoverview Application Constants
 * @description Central configuration for application-wide constants.
 *              Modify these values to change system behavior without touching business logic.
 *
 * @module config/constants
 *
 * TABLE OF CONTENTS:
 * ─────────────────────────────────────────────────────────────────────────────
 * 1. WORK_TYPES         - Supported media types (movie, series, music, etc.)
 * 2. IMAGE_BASE_URL     - Base URL for serving uploaded images
 * 3. RATING_CONSTRAINTS - Rating system min/max/step constraints
 * 4. USER_CONSTRAINTS   - User input validation limits
 * 5. QUERY_LIMITS       - Result limits for expensive queries
 * 6. HTTP_STATUS        - Standard HTTP status codes
 * 7. GENRES             - Supported content genres
 * ─────────────────────────────────────────────────────────────────────────────
 */

// ═══════════════════════════════════════════════════════════════════════════════
// SECTION 1: WORK TYPES
// ═══════════════════════════════════════════════════════════════════════════════

/**
 * Supported work types across the platform.
 * Defines the types of media that can be tracked and rated.
 *
 * @constant {Readonly<Object>}
 * @property {string} MOVIE         - Feature films
 * @property {string} SERIES        - TV series and shows
 * @property {string} MUSIC         - Albums and tracks
 * @property {string} BOOK          - Books and ebooks
 * @property {string} GRAPHIC_NOVEL - Comics and graphic novels
 */
export const WORK_TYPES = Object.freeze({
    MOVIE: 'movie',
    SERIES: 'series',
    MUSIC: 'music',
    BOOK: 'book',
    GRAPHIC_NOVEL: 'graphic-novel'
});

// ═══════════════════════════════════════════════════════════════════════════════
// SECTION 2: IMAGE CONFIGURATION
// ═══════════════════════════════════════════════════════════════════════════════

/**
 * Base URL for serving uploaded images.
 * Used to construct full URLs for profile pictures and media covers.
 *
 * @constant {string}
 * @default 'http://localhost:3000/uploads'
 * @env IMAGE_BASE_URL - Set in production (e.g., 'https://cdn.example.com/uploads')
 */
export const IMAGE_BASE_URL = process.env.IMAGE_BASE_URL || 'http://localhost:3000/uploads';

// ═══════════════════════════════════════════════════════════════════════════════
// SECTION 3: RATING CONSTRAINTS
// ═══════════════════════════════════════════════════════════════════════════════

/**
 * Rating system constraints.
 * Enforces consistent rating behavior (1-5 stars, integers only).
 *
 * @constant {Readonly<Object>}
 * @property {number} MIN  - Minimum rating value (1 star)
 * @property {number} MAX  - Maximum rating value (5 stars)
 * @property {number} STEP - Rating increment (1 = integers only, no half-stars)
 */
export const RATING_CONSTRAINTS = Object.freeze({
    MIN: 1,
    MAX: 5,
    STEP: 1
});

// ═══════════════════════════════════════════════════════════════════════════════
// SECTION 4: USER CONSTRAINTS
// ═══════════════════════════════════════════════════════════════════════════════

/**
 * User input validation constraints.
 * Prevents abuse and ensures consistent data quality.
 *
 * @constant {Readonly<Object>}
 * @property {number} USERNAME_MIN_LENGTH - Minimum username length (3 chars)
 * @property {number} USERNAME_MAX_LENGTH - Maximum username length (20 chars)
 * @property {number} PASSWORD_MIN_LENGTH - Minimum password length (6 chars)
 */
export const USER_CONSTRAINTS = Object.freeze({
    USERNAME_MIN_LENGTH: 3,
    USERNAME_MAX_LENGTH: 20,
    PASSWORD_MIN_LENGTH: 6
});

// ═══════════════════════════════════════════════════════════════════════════════
// SECTION 5: QUERY LIMITS
// ═══════════════════════════════════════════════════════════════════════════════

/**
 * Query result limits for expensive operations.
 * Prevents performance degradation from unbounded result sets.
 *
 * @constant {Readonly<Object>}
 * @property {number} SIMILAR_WORKS      - Max similar works per recommendation
 * @property {number} POPULAR_WORKS      - Max popular works returned to client
 * @property {number} POPULAR_WORKS_FETCH - Internal fetch limit before sorting
 */
export const QUERY_LIMITS = Object.freeze({
    SIMILAR_WORKS: 10,
    POPULAR_WORKS: 10,
    POPULAR_WORKS_FETCH: 50  // Fetch 50 → sort by rating → return top 10
});

// ═══════════════════════════════════════════════════════════════════════════════
// SECTION 6: HTTP STATUS CODES
// ═══════════════════════════════════════════════════════════════════════════════

/**
 * Standardized HTTP status codes for API responses.
 *
 * @constant {Readonly<Object>}
 * @property {number} OK                    - 200: Successful GET/PUT/PATCH
 * @property {number} CREATED               - 201: Successful POST (resource created)
 * @property {number} NO_CONTENT            - 204: Successful DELETE
 * @property {number} BAD_REQUEST           - 400: Invalid client input
 * @property {number} UNAUTHORIZED          - 401: Auth required or failed
 * @property {number} NOT_FOUND             - 404: Resource not found
 * @property {number} INTERNAL_SERVER_ERROR - 500: Unexpected server error
 */
export const HTTP_STATUS = Object.freeze({
    OK: 200,
    CREATED: 201,
    NO_CONTENT: 204,
    BAD_REQUEST: 400,
    UNAUTHORIZED: 401,
    NOT_FOUND: 404,
    INTERNAL_SERVER_ERROR: 500
});

// ═══════════════════════════════════════════════════════════════════════════════
// SECTION 7: GENRES
// ═══════════════════════════════════════════════════════════════════════════════

/**
 * Standardized genre list for filtering and categorization.
 * Applies across all work types. Alphabetically ordered.
 *
 * @constant {Readonly<string[]>}
 */
export const GENRES = Object.freeze([
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
]);
