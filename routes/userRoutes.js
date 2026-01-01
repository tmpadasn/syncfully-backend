// User routes: CRUD, ratings, recommendations, shelves, social
import express from 'express';
import * as userController from '../controllers/userController.js';
import * as shelfController from '../controllers/shelfController.js';
import { validateRequiredFields, validateIdParam } from '../middleware/validation.js';

const router = express.Router();
const v = validateIdParam;
const vrf = validateRequiredFields;

router.get('/', userController.getAllUsers);
router.post('/', vrf(['username', 'email', 'password']), userController.createUser);
router.get('/:userId', v('userId'), userController.getUserById);
router.put('/:userId', v('userId'), userController.updateUser);
router.delete('/:userId', v('userId'), userController.deleteUser);
router.get('/:userId/ratings', v('userId'), userController.getUserRatings);
router.post('/:userId/ratings', v('userId'), vrf(['workId', 'score']), userController.addUserRating);
router.get('/:userId/recommendations', v('userId'), userController.getUserRecommendations);
router.get('/:userId/shelves', v('userId'), shelfController.getUserShelves);
router.post('/:userId/shelves', v('userId'), vrf(['name']), shelfController.createShelf);
// Social features
router.get('/:userId/following', userController.getUserFollowing);
router.get('/:userId/followers', userController.getUserFollowers);
router.post('/:userId/following/:targetUserId', userController.followUser);
router.delete('/:userId/following/:targetUserId', userController.unfollowUser);

export default router;
