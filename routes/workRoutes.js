// Work routes: CRUD, discovery, ratings
import express from 'express';
import * as workController from '../controllers/workController.js';
import * as ratingController from '../controllers/ratingController.js';
import { validateRequiredFields, validateIdParam } from '../middleware/validation.js';

const router = express.Router();
const v = validateIdParam;
const vrf = validateRequiredFields;

// Discovery (must be before /:workId)
router.get('/popular', workController.getPopularWorks);
router.get('/', workController.getAllWorks);
router.post('/', vrf(['title', 'type']), workController.createWork);
router.get('/:workId', v('workId'), workController.getWorkById);
router.put('/:workId', v('workId'), workController.updateWork);
router.delete('/:workId', v('workId'), workController.deleteWork);
router.get('/:workId/similar', v('workId'), workController.getSimilarWorks);
router.get('/:workId/ratings', v('workId'), ratingController.getWorkRatings);
router.post('/:workId/ratings', v('workId'), vrf(['userId', 'score']), ratingController.createWorkRating);
router.get('/:workId/ratings/average', v('workId'), ratingController.getWorkAverageRating);

export default router;
