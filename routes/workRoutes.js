/**
 * Work Routes - /api/works
 * Handles media work operations, discovery features, and ratings.
 */

import express from 'express';
import * as workController from '../controllers/workController.js';
import * as ratingController from '../controllers/ratingController.js';
import { validateRequiredFields, validateIdParam } from '../middleware/validation.js';

const router = express.Router();

// Discovery (must be before /:workId)
router.get('/popular', workController.getPopularWorks);

// Work CRUD
router.get('/', workController.getAllWorks);
router.post('/', validateRequiredFields(['title', 'type']), workController.createWork);
router.get('/:workId', validateIdParam('workId'), workController.getWorkById);
router.put('/:workId', validateIdParam('workId'), workController.updateWork);
router.delete('/:workId', validateIdParam('workId'), workController.deleteWork);

// Work Discovery
router.get('/:workId/similar', validateIdParam('workId'), workController.getSimilarWorks);

// Work Ratings
router.get('/:workId/ratings', validateIdParam('workId'), ratingController.getWorkRatings);
router.post('/:workId/ratings', validateIdParam('workId'), validateRequiredFields(['userId', 'score']), ratingController.createWorkRating);
router.get('/:workId/ratings/average', validateIdParam('workId'), ratingController.getWorkAverageRating);

export default router;
