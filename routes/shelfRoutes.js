/**
 * Shelf Routes - /api/shelves
 * Handles user collections for organizing works.
 */

import express from 'express';
import * as shelfController from '../controllers/shelfController.js';
import { validateIdParam } from '../middleware/validation.js';

const router = express.Router();

// Shelf CRUD
router.get('/', shelfController.getAllShelves);
router.get('/:shelfId', validateIdParam('shelfId'), shelfController.getShelfById);
router.put('/:shelfId', validateIdParam('shelfId'), shelfController.updateShelf);
router.delete('/:shelfId', validateIdParam('shelfId'), shelfController.deleteShelf);

// Shelf Works Management
router.get('/:shelfId/works', validateIdParam('shelfId'), shelfController.getShelfWorks);
router.post('/:shelfId/works/:workId', validateIdParam('shelfId'), validateIdParam('workId'), shelfController.addWorkToShelf);
router.delete('/:shelfId/works/:workId', validateIdParam('shelfId'), validateIdParam('workId'), shelfController.removeWorkFromShelf);

export default router;
