import User from '../models/User.js';
import { mockUsers, getNextUserId } from '../data/mockUsers.js';
import { isMongoConnected } from '../config/database.js';
import { isValidEmail } from '../utils/validators.js';
import { buildImageUrl } from '../utils/imageHelpers.js';
import { safeParseInt } from '../utils/helpers.js';

/**
 * Helper: Find mock user by ID
 * @param {number|string} userId - User ID
 * @returns {Object|null} User object or null
 */
const findMockUserById = (userId) => {
  const parsedId = safeParseInt(userId, 'userId');
  return mockUsers.find(u => u.id === parsedId) || null;
};

/**
 * Get all users
 * @returns {Promise<Array>}
 */
export const getAllUsers = async () => {
  if (isMongoConnected()) {
    const users = await User.find().select('-password');
    return users.map(user => ({
      userId: user._id,
      username: user.username,
      email: user.email,
      profilePictureUrl: user.profilePictureUrl,
      ratedWorks: user.ratedWorksCount
    }));
  }

  // Use mock data
  return mockUsers.map(user => ({
    userId: user.id,
    username: user.username,
    email: user.email,
    profilePictureUrl: user.profilePictureUrl,
    ratedWorks: Object.keys(user.ratedWorks).length
  }));
};

/**
 * Get user by ID
 * @param {number|string} userId - User ID
 * @returns {Promise<Object|null>}
 */
export const getUserById = async (userId) => {
  if (isMongoConnected()) {
    const user = await User.findById(userId).select('-password');
    if (!user) return null;

    return {
      userId: user._id,
      username: user.username,
      email: user.email,
      profilePictureUrl: buildImageUrl(user.profilePictureUrl, 'profile'), // Use helper
      ratedWorks: user.ratedWorksCount
    };
  }

  const user = findMockUserById(userId);
  if (!user) return null;

  return {
    userId: user.id,
    username: user.username,
    email: user.email,
    profilePictureUrl: buildImageUrl(user.profilePictureUrl, 'profile'), // Use helper
    ratedWorks: Object.keys(user.ratedWorks).length
  };
};

/**
 * Create new user
 * @param {Object} userData - User data
 * @returns {Promise<Object>}
 */
export const createUser = async (userData) => {
  const { username, email, password, profilePictureUrl } = userData;

  // Validate email format
  if (!isValidEmail(email)) {
    throw new Error('Invalid email format');
  }

  if (isMongoConnected()) {
    // Check if user exists
    const existingUser = await User.findOne({ $or: [{ email }, { username }] });
    if (existingUser) {
      if (existingUser.email === email) {
        throw new Error('Email already exists');
      }
      if (existingUser.username === username) {
        throw new Error('Username already exists');
      }
    }

    const user = new User({
      username,
      email,
      password,
      profilePictureUrl: "http://localhost:3000/uploads/profiles/profile_picture.jpg",
    });

    await user.save();

    return {
      userId: user._id,
      username: user.username,
      email: user.email,
      profilePictureUrl: user.profilePictureUrl,
      ratedWorks: 0
    };
  }

  // Use mock data
  // Check if user exists
  const existingUser = mockUsers.find(u => u.email === email || u.username === username);
  if (existingUser) {
    if (existingUser.email === email) {
      throw new Error('Email already exists');
    }
    if (existingUser.username === username) {
      throw new Error('Username already exists');
    }
  }

  const newUser = {
    id: getNextUserId(),
    username,
    email,
    password, // In production, this would be hashed
    profilePictureUrl: profilePictureUrl || "http://localhost:3000/uploads/profiles/profile_picture.jpg",
    ratedWorks: {},
    recommendationVersion: Date.now()
  };

  mockUsers.push(newUser);

  return {
    userId: newUser.id,
    username: newUser.username,
    email: newUser.email,
    profilePictureUrl: newUser.profilePictureUrl,
    ratedWorks: 0
  };
};

/**
 * Update user
 * @param {number|string} userId - User ID
 * @param {Object} updateData - Data to update
 * @returns {Promise<Object|null>}
 */
export const updateUser = async (userId, updateData) => {
  const { username, email, password, profilePictureUrl } = updateData;

  if (email && !isValidEmail(email)) {
    throw new Error('Invalid email format');
  }

  if (isMongoConnected()) {
    const user = await User.findById(userId);
    if (!user) return null;

    // Check for duplicate username/email
    if (username || email) {
      const existingUser = await User.findOne({
        _id: { $ne: userId },
        $or: [
          ...(username ? [{ username }] : []),
          ...(email ? [{ email }] : [])
        ]
      });

      if (existingUser) {
        if (existingUser.username === username) {
          throw new Error('Username already exists');
        }
        if (existingUser.email === email) {
          throw new Error('Email already exists');
        }
      }
    }

    if (username) user.username = username;
    if (email) user.email = email;
    if (password) user.password = password;
    if (profilePictureUrl !== undefined) user.profilePictureUrl = profilePictureUrl;

    await user.save();

    return {
      userId: user._id,
      username: user.username,
      email: user.email,
      profilePictureUrl: user.profilePictureUrl,
      ratedWorks: user.ratedWorksCount
    };
  }

  // Use mock data
  const parsedId = safeParseInt(userId, 'userId');
  const userIndex = mockUsers.findIndex(u => u.id === parsedId);
  if (userIndex === -1) return null;

  // Check for duplicate username/email
  if (username || email) {
    const existingUser = mockUsers.find(u =>
      u.id !== parsedId &&
      (u.username === username || u.email === email)
    );

    if (existingUser) {
      if (existingUser.username === username) {
        throw new Error('Username already exists');
      }
      if (existingUser.email === email) {
        throw new Error('Email already exists');
      }
    }
  }

  if (username) mockUsers[userIndex].username = username;
  if (email) mockUsers[userIndex].email = email;
  if (password) mockUsers[userIndex].password = password;
  if (profilePictureUrl !== undefined) mockUsers[userIndex].profilePictureUrl = profilePictureUrl;

  return {
    userId: mockUsers[userIndex].id,
    username: mockUsers[userIndex].username,
    email: mockUsers[userIndex].email,
    profilePictureUrl: mockUsers[userIndex].profilePictureUrl,
    ratedWorks: Object.keys(mockUsers[userIndex].ratedWorks).length
  };
};

/**
 * Delete user
 * @param {number|string} userId - User ID
 * @returns {Promise<boolean>}
 */
export const deleteUser = async (userId) => {
  if (isMongoConnected()) {
    const result = await User.findByIdAndDelete(userId);
    return result !== null;
  }

  // Use mock data
  const parsedId = safeParseInt(userId, 'userId');
  const userIndex = mockUsers.findIndex(u => u.id === parsedId);
  if (userIndex === -1) return false;

  mockUsers.splice(userIndex, 1);
  return true;
};

/**
 * Get user's ratings
 * @param {number|string} userId - User ID
 * @returns {Promise<Object|null>}
 */
export const getUserRatings = async (userId) => {
  if (isMongoConnected()) {
    const user = await User.findById(userId);
    if (!user) return null;

    // Convert Map to plain object
    return Object.fromEntries(user.ratedWorks);
  }

  // Use mock data
  const user = findMockUserById(userId);
  if (!user) return null;

  return user.ratedWorks;
};

/**
 * Add or update user rating for a work
 * @param {number|string} userId - User ID
 * @param {number} workId - Work ID
 * @param {number} score - Rating score
 * @returns {Promise<Object|null>}
 */
export const addUserRating = async (userId, workId, score) => {
  if (isMongoConnected()) {
    const user = await User.findById(userId);
    if (!user) return null;

    user.ratedWorks.set(workId.toString(), {
      score,
      ratedAt: new Date()
    });

    await user.save();
    
    // Update recommendation version to trigger new recommendations
    await updateRecommendationVersion(userId);

    return {
      userId: user._id,
      workId,
      score,
      ratedAt: new Date()
    };
  }

  // Use mock data
  const user = findMockUserById(userId);
  if (!user) return null;

  user.ratedWorks[workId] = {
    score,
    ratedAt: new Date().toISOString()
  };
  
  // Update recommendation version to trigger new recommendations
  await updateRecommendationVersion(userId);

  return {
    userId: user.id,
    workId,
    score,
    ratedAt: new Date().toISOString()
  };
};

/**
 * Authenticate user using mock data (email or username + plain password)
 * @param {string} identifier - email OR username
 * @param {string} password - plain text password
 * @returns {Promise<Object>}
 */
export const authenticateUser = async (identifier, password) => {
  // We ignore Mongo here and always use mockUsers, as requested
  const ident = (identifier || '').toLowerCase();

  const user = mockUsers.find(
    (u) =>
      u.email.toLowerCase() === ident ||
      u.username.toLowerCase() === ident
  );

  if (!user) {
    // User not found
    throw new Error('User not found');
  }
  
  if (user.password !== password) {
    // Wrong password
    throw new Error('Invalid credentials');
  }

  // Return user in the same shape as getUserById
  return {
    userId: user.id,
    username: user.username,
    email: user.email,
    profilePictureUrl: buildImageUrl(user.profilePictureUrl, 'profile'),
    ratedWorks: Object.keys(user.ratedWorks).length
  };
};

/**
 * Get recommendation version for a user
 * @param {number|string} userId - User ID
 * @returns {Promise<number>}
 */
export const getRecommendationVersion = async (userId) => {
  if (isMongoConnected()) {
    const user = await User.findById(userId);
    if (!user) return Date.now();
    return user.recommendationVersion || Date.now();
  }

  // Use mock data
  const user = findMockUserById(userId);
  if (!user) return Date.now();
  return user.recommendationVersion || Date.now();
};

/**
 * Update recommendation version for a user (triggers new recommendations)
 * @param {number|string} userId - User ID
 * @returns {Promise<number>}
 */
export const updateRecommendationVersion = async (userId) => {
  const newVersion = Date.now();
  
  if (isMongoConnected()) {
    await User.findByIdAndUpdate(userId, { recommendationVersion: newVersion });
    return newVersion;
  }

  // Use mock data
  const user = findMockUserById(userId);
  if (user) {
    user.recommendationVersion = newVersion;
  }
  return newVersion;
};