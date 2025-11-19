import mongoose from 'mongoose';

/**
 * Connect to MongoDB database
 * @returns {Promise<void>}
 */
const connectDB = async () => {
    try {
        const mongoUri = process.env.MONGODB_URI;

        if (!mongoUri) {
            console.log('⚠️  No MongoDB URI provided. Running with mock data only.');
            return;
        }

        await mongoose.connect(mongoUri);
        console.log('✅ MongoDB connected successfully');
    } catch (error) {
        console.error('❌ MongoDB connection error:', error.message);
        console.log('⚠️  Falling back to mock data mode');
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
