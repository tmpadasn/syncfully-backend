/**
 * User Routes - /api/users
 * Handles user CRUD, ratings, recommendations, shelves, and social features.
 */

import express from 'express';
import * as userController from '../controllers/userController.js';
import * as shelfController from '../controllers/shelfController.js';
import { validateRequiredFields, validateIdParam } from '../middleware/validation.js';

const router = express.Router();

// User CRUD
router.get('/', userController.getAllUsers);
router.post('/', validateRequiredFields(['username', 'email', 'password']), userController.createUser);
router.get('/:userId', validateIdParam('userId'), userController.getUserById);
router.put('/:userId', validateIdParam('userId'), userController.updateUser);
router.delete('/:userId', validateIdParam('userId'), userController.deleteUser);

// User Ratings
router.get('/:userId/ratings', validateIdParam('userId'), userController.getUserRatings);
router.post('/:userId/ratings', validateIdParam('userId'), validateRequiredFields(['workId', 'score']), userController.addUserRating);

// User Recommendations
router.get('/:userId/recommendations', validateIdParam('userId'), userController.getUserRecommendations);

// User Shelves
router.get('/:userId/shelves', validateIdParam('userId'), shelfController.getUserShelves);
router.post('/:userId/shelves', validateIdParam('userId'), validateRequiredFields(['name']), shelfController.createShelf);

// Social Features
router.get('/:userId/following', userController.getUserFollowing);
router.get('/:userId/followers', userController.getUserFollowers);
router.post('/:userId/following/:targetUserId', userController.followUser);
router.delete('/:userId/following/:targetUserId', userController.unfollowUser);

export default router;
