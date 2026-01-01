/**
 * @fileoverview MongoDB Database Connection Module
 * @description Manages MongoDB/Mongoose database connection for the application.
 *
 * Connection Strategy:
 * - Attempts to connect using MONGODB_URI environment variable
 * - Falls back to mock data mode if no URI is provided or connection fails
 * - This graceful degradation allows development without a database
 *
 * Environment Variables:
 * - MONGODB_URI: Connection string for MongoDB (e.g., mongodb://localhost:27017/syncfully)
 *
 * Usage:
 * ```javascript
 * import connectDB, { isMongoConnected } from './config/database.js';
 *
 * // In app startup:
 * await connectDB();
 *
 * // Check connection status:
 * if (isMongoConnected()) {
 *   console.log('Using MongoDB');
 * } else {
 *   console.log('Using mock data');
 * }
 * ```
 *
 * @module config/database
 * @see utils/logger - Production logging utilities
 */

import mongoose from 'mongoose';
import { prodLog, prodError } from '../utils/logger.js';

// ============================================================================
// DATABASE CONNECTION
// ============================================================================

/**
 * Connect to MongoDB Database
 *
 * Establishes connection to MongoDB using Mongoose.
 * If MONGODB_URI is not set or connection fails, the application
 * will continue to run using mock data instead.
 *
 * @async
 * @function connectDB
 * @returns {Promise<void>} Resolves when connection attempt completes
 *
 * @example
 * // In server.js or app.js:
 * await connectDB();
 */
const connectDB = async () => {
    try {
        // Get MongoDB connection string from environment
        const mongoUri = process.env.MONGODB_URI;

        // Check if URI is configured
        if (!mongoUri) {
            prodLog('⚠️  No MongoDB URI provided. Running with mock data only.');
            return;
        }

        // Attempt to establish connection
        await mongoose.connect(mongoUri);
        prodLog('✅ MongoDB connected successfully');
    } catch (error) {
        // Log error but don't crash - fall back to mock data
        prodError('❌ MongoDB connection error:', error.message);
        prodLog('⚠️  Falling back to mock data mode');
    }
};

// ============================================================================
// CONNECTION STATUS
// ============================================================================

/**
 * Check if MongoDB is Connected
 *
 * Returns the current connection state of Mongoose.
 * Useful for conditional logic based on database availability.
 *
 * Mongoose Ready States:
 * - 0: disconnected
 * - 1: connected ✓
 * - 2: connecting
 * - 3: disconnecting
 *
 * @function isMongoConnected
 * @returns {boolean} True if connected, false otherwise
 *
 * @example
 * if (isMongoConnected()) {
 *   // Query from database
 * } else {
 *   // Use mock data
 * }
 */
export const isMongoConnected = () => {
    return mongoose.connection.readyState === 1;
};

export default connectDB;

