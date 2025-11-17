import express from 'express';
import userRoutes from './userRoutes.js';
import workRoutes from './workRoutes.js';
import ratingRoutes from './ratingRoutes.js';

const router = express.Router();

// Mount routes
router.use('/users', userRoutes);
router.use('/works', workRoutes);
router.use('/ratings', ratingRoutes);

// TODO: Add search route
// router.use('/search', searchRoutes);

export default router;
