/**
 * @fileoverview Application Entry Point
 * @description Main server file that initializes and starts the Express application.
 *
 * This is the primary entry point for the Syncfully backend API.
 * It handles environment configuration, database connection, and server startup.
 *
 * Startup Sequence:
 * 1. Load environment variables from .env file
 * 2. Import configured Express app from app.js
 * 3. Attempt MongoDB connection (falls back to mock data if unavailable)
 * 4. Start HTTP server on configured port
 *
 * Environment Variables:
 * - PORT: Server port (default: 3000)
 * - NODE_ENV: Environment mode (development/production)
 * - MONGODB_URI: Database connection string (optional)
 *
 * @module server
 * @see app.js - Express application configuration
 * @see config/database.js - MongoDB connection handler
 */

import dotenv from 'dotenv';

// Load environment variables from .env file before any other imports
// This ensures all modules have access to configured environment variables
dotenv.config();

import app from './app.js';
import connectDB from './config/database.js';
import { prodLog, prodError } from './utils/logger.js';

// =============================================================================
// SERVER CONFIGURATION
// =============================================================================

// Server port with fallback to 3000 for development
const PORT = process.env.PORT || 3000;

// =============================================================================
// SERVER STARTUP
// =============================================================================

/**
 * Initializes database connection and starts the Express server.
 *
 * The server will start even if MongoDB connection fails, as the application
 * can operate with mock data for development and testing purposes.
 *
 * @async
 * @returns {Promise<void>}
 */
const startServer = async () => {
  try {
    // Attempt database connection (optional - uses mock data as fallback)
    await connectDB();

    // Start Express HTTP server
    app.listen(PORT, () => {
      prodLog(`🚀 Server running on port ${PORT}`);
      prodLog(`📝 Environment: ${process.env.NODE_ENV || 'development'}`);
    });
  } catch (error) {
    // Log fatal error and exit with failure code
    prodError('Failed to start server:', error);
    process.exit(1);
  }
};

// Execute server startup
startServer();
