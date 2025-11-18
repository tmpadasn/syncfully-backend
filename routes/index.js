import express from 'express';
import userRoutes from './userRoutes.js';
import workRoutes from './workRoutes.js';

const router = express.Router();

// Mount routes
router.use('/users', userRoutes);
router.use('/works', workRoutes);

// TODO: Add other routes
// router.use('/ratings', ratingRoutes);
// router.use('/search', searchRoutes);

export default router;
