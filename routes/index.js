import express from 'express';
import userRoutes from './userRoutes.js';
import workRoutes from './workRoutes.js';
import ratingRoutes from './ratingRoutes.js';
import searchRoutes from './searchRoutes.js';
import authRoutes from './authRoutes.js';

const router = express.Router();

// Auth routes
router.use('/auth', authRoutes);

router.use('/users', userRoutes);
router.use('/works', workRoutes);
router.use('/ratings', ratingRoutes);
router.use('/search', searchRoutes);

export default router;
