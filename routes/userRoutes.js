import express from 'express';
import * as userController from '../controllers/userController.js';
import * as shelfController from '../controllers/shelfController.js';
import { validateRequiredFields, validateIdParam } from '../middleware/validation.js';

const router = express.Router();

/**
 * @route   GET /api/users
 * @desc    Get all users
 * @access  Public
 */
router.get('/', userController.getAllUsers);

/**
 * @route   POST /api/users
 * @desc    Create a new user
 * @access  Public
 */
router.post(
    '/',
    validateRequiredFields(['username', 'email', 'password']),
    userController.createUser
);

/**
 * @route   GET /api/users/:userId
 * @desc    Get user by ID
 * @access  Public
 */
router.get(
    '/:userId',
    validateIdParam('userId'),
    userController.getUserById
);

/**
 * @route   PUT /api/users/:userId
 * @desc    Update user
 * @access  Public
 */
router.put(
    '/:userId',
    validateIdParam('userId'),
    userController.updateUser
);

/**
 * @route   DELETE /api/users/:userId
 * @desc    Delete user
 * @access  Public
 */
router.delete(
    '/:userId',
    validateIdParam('userId'),
    userController.deleteUser
);

/**
 * @route   GET /api/users/:userId/ratings
 * @desc    Get user's ratings
 * @access  Public
 */
router.get(
    '/:userId/ratings',
    validateIdParam('userId'),
    userController.getUserRatings
);

/**
 * @route   POST /api/users/:userId/ratings
 * @desc    Add user rating for a work
 * @access  Public
 */
router.post(
    '/:userId/ratings',
    validateIdParam('userId'),
    validateRequiredFields(['workId', 'score']),
    userController.addUserRating
);

/**
 * @route   GET /api/users/:userId/recommendations
 * @desc    Get user recommendations
 * @access  Public
 */
router.get(
    '/:userId/recommendations',
    validateIdParam('userId'),
    userController.getUserRecommendations
);

/**
 * @route   GET /api/users/:userId/shelves
 * @desc    Get all shelves for a user
 * @access  Public
 */
router.get(
    '/:userId/shelves',
    validateIdParam('userId'),
    shelfController.getUserShelves
);

/**
 * @route   POST /api/users/:userId/shelves
 * @desc    Create a new shelf for a user
 * @access  Public
 */
router.post(
    '/:userId/shelves',
    validateIdParam('userId'),
    validateRequiredFields(['name']),
    shelfController.createShelf
);

export default router;
