/**
 * Express Application Configuration
 *
 * Main application file that configures Express middleware, routes, and error handling.
 * This file sets up the app but does not start the server - see server.js for that.
 */

import express from 'express';
import cors from 'cors';
import path from 'path';
import { fileURLToPath } from 'url';
import { logger } from './middleware/logger.js';
import { errorHandler, notFoundHandler } from './middleware/errorHandler.js';
import routes from './routes/index.js';

/**
 * ES Module compatibility helpers
 *
 * __dirname is not available in ES modules, so we construct it manually.
 * This allows path.join() to work with relative paths like in CommonJS.
 */
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Initialize Express application
const app = express();

/**
 * Middleware Stack
 *
 * Order matters - middleware is executed in the order it's registered.
 * Each middleware can modify req/res or pass control to the next.
 */

// CORS - Allow cross-origin requests from frontend
app.use(cors());

// Body parsers - Parse JSON and URL-encoded request bodies
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

/**
 * Static file serving for uploaded images
 *
 * Maps /uploads URL path to public/uploads directory on disk.
 * Used for profile pictures and media cover images.
 * Example: GET /uploads/profiles/user1.jpg -> public/uploads/profiles/user1.jpg
 */
app.use('/uploads', express.static(path.join(__dirname, 'public/uploads')));

// Request logging - Log all incoming requests
app.use(logger);

/**
 * Health check endpoint
 *
 * Simple endpoint to verify server is running.
 * Used by monitoring tools and deployment pipelines.
 * Returns JSON with timestamp for debugging.
 *
 * @route GET /health
 * @returns {Object} 200 - Server status
 */
// eslint-disable-next-line no-unused-vars
app.get('/health', (_req, res) => {
    res.json({
        success: true,
        message: 'Server is running',
        timestamp: new Date().toISOString()
    });
});

/**
 * API Routes
 *
 * All application routes are mounted under /api prefix.
 * Routes are defined in routes/index.js and split by resource.
 * Example: /api/users, /api/works, /api/ratings
 */
app.use('/api', routes);

/**
 * Error Handling
 *
 * MUST be registered last - catches errors from all previous middleware.
 * notFoundHandler catches unmatched routes (404s).
 * errorHandler catches all other errors and formats responses.
 */
app.use(notFoundHandler);
app.use(errorHandler);

// Export app for testing and server.js
export default app;
