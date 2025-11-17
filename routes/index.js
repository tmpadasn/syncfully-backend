import express from 'express';
import userRoutes from './userRoutes.js';

const router = express.Router();

// Mount routes
router.use('/users', userRoutes);

// TODO: Add other routes
// router.use('/works', workRoutes);
// router.use('/ratings', ratingRoutes);
// router.use('/search', searchRoutes);

export default router;
