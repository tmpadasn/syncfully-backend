/**
 * Search Routes - /api/search
 * Cross-resource search functionality for works and users.
 */

import express from 'express';
import searchController from '../controllers/searchController.js';

const router = express.Router();

router.get('/', searchController.searchItems);

export default router;
