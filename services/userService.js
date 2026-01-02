/**
 * User Service Facade
 * Re-exports from specialized modules (userService, userFollowService, userRatingService)
 * for backward compatibility. See individual modules for full documentation.
 */

export {
  getAllUsers,
  getUserById,
  createUser,
  updateUser,
  deleteUser,
  authenticateUser,
  getRecommendationVersion,
  updateRecommendationVersion
} from './user/userService.js';

export {
  getUserFollowing,
  getUserFollowers,
  followUser,
  unfollowUser
} from './user/userFollowService.js';

export {
  getUserRatings,
  addUserRating
} from './user/userRatingService.js';
