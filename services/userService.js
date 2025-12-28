// Re-export all functions from split user service files for backwards compatibility
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
