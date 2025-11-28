import dotenv from 'dotenv';

dotenv.config();

import app from './app.js';
import connectDB from './config/database.js';
import { prodLog, prodError } from './utils/logger.js';

const PORT = process.env.PORT || 3000;

/**
 * Start the server
 */
const startServer = async () => {
  try {
    // Connect to MongoDB (optional - falls back to mock data)
    await connectDB();

    // Start Express server
    app.listen(PORT, () => {
      prodLog(`🚀 Server running on port ${PORT}`);
      prodLog(`📝 Environment: ${process.env.NODE_ENV || 'development'}`);
    });
  } catch (error) {
    prodError('Failed to start server:', error);
    process.exit(1);
  }
};

startServer();


