// routes/searchRoutes.js
import express from 'express';
import searchController from '../controllers/searchController.js';

const router = express.Router();

// GET /search
router.get('/', searchController.searchItems);

export default router;
