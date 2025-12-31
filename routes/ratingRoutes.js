/**
 * Rating Routes - /api/ratings
 * Direct rating CRUD operations.
 */

import express from 'express';
import * as ratingController from '../controllers/ratingController.js';
import { validateRequiredFields, validateIdParam } from '../middleware/validation.js';

const router = express.Router();

router.get('/', ratingController.getAllRatings);
router.get('/:ratingId', validateIdParam('ratingId'), ratingController.getRatingById);
router.put('/:ratingId', validateIdParam('ratingId'), validateRequiredFields(['score']), ratingController.updateRating);
router.delete('/:ratingId', validateIdParam('ratingId'), ratingController.deleteRating);

export default router;
