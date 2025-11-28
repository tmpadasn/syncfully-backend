import mongoose from 'mongoose';
import { prodLog, prodError } from '../utils/logger.js';

/**
 * Connect to MongoDB database
 * @returns {Promise<void>}
 */
const connectDB = async () => {
    try {
        const mongoUri = process.env.MONGODB_URI;

        if (!mongoUri) {
            prodLog('⚠️  No MongoDB URI provided. Running with mock data only.');
            return;
        }

        await mongoose.connect(mongoUri);
        prodLog('✅ MongoDB connected successfully');
    } catch (error) {
        prodError('❌ MongoDB connection error:', error.message);
        prodLog('⚠️  Falling back to mock data mode');
    }
};

/**
 * Check if MongoDB is connected
 * @returns {boolean}
 */
export const isMongoConnected = () => {
    return mongoose.connection.readyState === 1;
};

export default connectDB;
