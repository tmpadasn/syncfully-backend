/**
 * User Service Facade
 * 
 * This file serves as a centralized entry point for all user-related business logic.
 * It aggregates functions from specialized service modules to maintain backward compatibility
 * with the rest of the application that imports from 'userService.js'.
 * 
 * The service logic has been split into smaller, focused modules:
 * - userService.js (core): Handles basic CRUD operations (create, read, update, delete) and authentication.
 * - userFollowService.js: Manages social graph relationships (following/followers).
 * - userRatingService.js: Handles user interactions with works (ratings).
 */

// Re-export all functions from split user service files for backwards compatibility
export {
  /**
   * Retrieves all users from the data source.
   * Useful for admin dashboards or directory listings.
   */
  getAllUsers,

  /**
   * Finds a single user by their unique ID.
   * Returns validation errors if the ID format is invalid or if the user doesn't exist.
   */
  getUserById,

  /**
   * Creates a new user account.
   * Handles password hashing and initial profile setup.
   */
  createUser,

  /**
   * Updates an existing user's profile information.
   * Supports partial updates (e.g., only changing email or profile picture).
   */
  updateUser,

  /**
   * Permanently removes a user account.
   * This action is irreversible and should be used with caution.
   */
  deleteUser,

  /**
   * Verifies user credentials during login.
   * Compares provided password against the stored hash.
   */
  authenticateUser,

  /**
   * Gets the current recommendation engine version for a user.
   * Used to invalidate client-side caches when recommendations change.
   */
  getRecommendationVersion,

  /**
   * Updates the recommendation version.
   * Triggered when user preferences or ratings change significantly.
   */
  updateRecommendationVersion
} from './user/userService.js';

export {
  /**
   * Retrieves the list of users that a specific user follows.
   * Returns an array of user objects.
   */
  getUserFollowing,

  /**
   * Retrieves the list of users who follow a specific user.
   * Returns an array of user objects.
   */
  getUserFollowers,

  /**
   * Establishes a "follow" relationship between two users.
   * The source user will see the target user's updates.
   */
  followUser,

  /**
   * Removes a "follow" relationship between two users.
   * The source user will no longer see the target user's updates.
   */
  unfollowUser
} from './user/userFollowService.js';

export {
  /**
   * Retrieves all ratings given by a specific user.
   * Includes metadata about the rated works.
   */
  getUserRatings,

  /**
   * Adds or updates a rating for a specific work by a user.
   * Triggers a recalculation of the work's average rating.
   */
  addUserRating
} from './user/userRatingService.js';
