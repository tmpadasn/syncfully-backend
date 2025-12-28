/**
 * User Model
 *
 * Mongoose schema for user accounts and authentication.
 * Handles user credentials, profile data, ratings, and social connections.
 * NOTE: Currently not used - application runs with mock data only.
 */

import mongoose from 'mongoose';
import bcrypt from 'bcrypt';
import { createToJSONTransform } from '../utils/modelHelpers.js';

/**
 * User Schema Definition
 *
 * Stores user account information including:
 * - Authentication credentials (username, email, password)
 * - Profile information (profile picture)
 * - User ratings (embedded as Map for fast lookup)
 * - Social connections (followers/following arrays)
 * - Recommendation versioning for cache invalidation
 */
const userSchema = new mongoose.Schema({
    /**
     * Username - unique identifier for the account
     *
     * Constraints:
     * - Required and unique across all users
     * - Auto-trimmed to remove whitespace
     * - Length: 3-20 characters
     */
    username: {
        type: String,
        required: [true, 'Username is required'],
        unique: true,
        trim: true,
        minlength: [3, 'Username must be at least 3 characters long'],
        maxlength: [20, 'Username cannot exceed 20 characters']
    },

    /**
     * Email - for authentication and notifications
     *
     * Constraints:
     * - Required and unique
     * - Auto-converted to lowercase
     * - Basic format validation via regex
     */
    email: {
        type: String,
        required: [true, 'Email is required'],
        unique: true,
        lowercase: true,
        trim: true,
        match: [/^\S+@\S+\.\S+$/, 'Please provide a valid email address']
    },

    /**
     * Password - bcrypt hashed before storage
     *
     * SECURITY:
     * - Never stored in plain text
     * - Hashed with bcrypt salt in pre-save hook
     * - Excluded from JSON responses via toJSON transform
     * - Minimum 6 characters (consider increasing for production)
     */
    password: {
        type: String,
        required: [true, 'Password is required'],
        minlength: [6, 'Password must be at least 6 characters long']
    },

    /**
     * Profile picture URL
     *
     * Stores relative path to uploaded image.
     * Combined with IMAGE_BASE_URL from config to form complete URL.
     * Null if user hasn't uploaded a picture.
     */
    profilePictureUrl: {
        type: String,
        default: null
    },

    /**
     * Recommendation version timestamp
     *
     * Updated whenever user rates a work.
     * Used to invalidate cached recommendations.
     * Frontend can compare versions to know when to refetch.
     */
    recommendationVersion: {
        type: Number,
        default: Date.now
    },

    /**
     * Rated works - embedded ratings map
     *
     * Structure: Map<workId, {score: Number, ratedAt: Date}>
     * Allows O(1) lookup of "has user rated this work?"
     * Alternative: separate Ratings collection (normalized approach)
     *
     * Constraints:
     * - Score: 1-5 (integer only, no decimals)
     * - ratedAt: auto-set to current time
     */
    ratedWorks: {
        type: Map,
        of: {
            score: {
                type: Number,
                required: true,
                min: 1,
                max: 5,
                validate: {
                    validator: Number.isInteger,
                    message: 'Score must be an integer between 1 and 5'
                }
            },
            ratedAt: {
                type: Date,
                default: Date.now
            }
        },
        default: new Map()
    },

    /**
     * Followers - users who follow this user
     *
     * Array of User ObjectIds for easy population.
     * Bidirectional relationship managed in application code.
     * When A follows B: A.following includes B, B.followers includes A
     */
    followers: [{
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User'
    }],

    /**
     * Following - users this user follows
     *
     * Array of User ObjectIds for easy population.
     * Managed in sync with followers array.
     */
    following: [{
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User'
    }]
}, {
    /**
     * Schema Options
     *
     * timestamps: Automatically adds createdAt and updatedAt fields
     * toJSON: Transforms document when converting to JSON for API responses
     */
    timestamps: true,
    toJSON: {
        /**
         * Custom JSON transformation
         *
         * Executed when document.toJSON() is called.
         * Handles:
         * 1. Rename _id to userId for API consistency
         * 2. Remove password field for security
         * 3. Convert Map to plain object (Maps don't serialize well)
         */
        transform: function (doc, ret) {
            // Use standard transform for ID and password
            createToJSONTransform('userId', ['password'])(doc, ret);

            // Convert ratedWorks Map to object for JSON response
            if (ret.ratedWorks instanceof Map) {
                ret.ratedWorks = Object.fromEntries(ret.ratedWorks);
            }

            return ret;
        }
    }
});

/**
 * Pre-save Hook: Hash Password
 *
 * Automatically hashes password before saving to database.
 * Only runs if password field was modified (avoids re-hashing on updates).
 * Uses bcrypt with salt rounds = 10 (good security/performance balance).
 *
 * @hook pre-save
 */
userSchema.pre('save', async function (next) {
    // Skip if password hasn't changed (e.g., updating email only)
    if (!this.isModified('password')) return next();

    try {
        const salt = await bcrypt.genSalt(10);
        this.password = await bcrypt.hash(this.password, salt);
        next();
    } catch (error) {
        next(error);
    }
});

/**
 * Instance Method: Compare Password
 *
 * Verifies provided password against stored hash.
 * Used during login to authenticate users.
 * Uses bcrypt.compare for timing-attack resistance.
 *
 * @param {string} candidatePassword - Plain text password to verify
 * @returns {Promise<boolean>} True if password matches, false otherwise
 * @example
 * const user = await User.findOne({ email: 'user@example.com' });
 * const isValid = await user.comparePassword('userPassword123');
 * if (isValid) { // login success }
 */
userSchema.methods.comparePassword = async function (candidatePassword) {
    return await bcrypt.compare(candidatePassword, this.password);
};

/**
 * Virtual Property: Rated Works Count
 *
 * Computed property - not stored in database.
 * Returns number of works the user has rated.
 * Useful for displaying stats without iterating ratedWorks Map.
 *
 * @returns {number} Count of rated works
 * @example
 * const user = await User.findById(userId);
 * console.log(user.ratedWorksCount); // e.g., 42
 */
userSchema.virtual('ratedWorksCount').get(function () {
    return this.ratedWorks ? this.ratedWorks.size : 0;
});

// Create and export model
const User = mongoose.model('User', userSchema);

export default User;
