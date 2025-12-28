/**
 * Rating Model
 *
 * Mongoose schema for user ratings of works.
 * Links users to works with a numerical score.
 * NOTE: Currently not used - application runs with mock data only.
 */

import mongoose from 'mongoose';
import { RATING_CONSTRAINTS } from '../config/constants.js';
import { createToJSONOptions } from '../utils/modelHelpers.js';

/**
 * Rating Schema Definition
 *
 * Represents a single user's rating of a single work.
 * Enforces one rating per user per work via compound index.
 *
 * Design Decision:
 * - Normalized approach (separate collection) vs embedded (in User.ratedWorks)
 * - Separate collection chosen for easier aggregation of work ratings
 * - Trade-off: More queries needed, but better for analytics
 */
const ratingSchema = new mongoose.Schema({
    /**
     * User ID - who submitted the rating
     *
     * References User model for population.
     * Required - ratings must belong to a user.
     * Used in compound index with workId for uniqueness.
     */
    userId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User',
        required: [true, 'User ID is required']
    },

    /**
     * Work ID - what was rated
     *
     * References Work model for population.
     * Required - ratings must target a work.
     * Used in compound index with userId for uniqueness.
     */
    workId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Work',
        required: [true, 'Work ID is required']
    },

    /**
     * Score - the rating value
     *
     * Constraints from RATING_CONSTRAINTS:
     * - Range: 1-5 (MIN to MAX)
     * - Must be integer (no half-stars)
     * - Required field
     *
     * Validation happens at both schema and application layer.
     */
    score: {
        type: Number,
        required: [true, 'Score is required'],
        min: [RATING_CONSTRAINTS.MIN, `Score must be at least ${RATING_CONSTRAINTS.MIN}`],
        max: [RATING_CONSTRAINTS.MAX, `Score must not exceed ${RATING_CONSTRAINTS.MAX}`],
        validate: {
            validator: Number.isInteger,
            message: 'Score must be an integer (no decimals allowed)'
        }
    },

    /**
     * Rated At - when the rating was submitted
     *
     * Auto-populated with current time on creation.
     * Allows tracking rating history and trends over time.
     * Updated when user changes their rating.
     */
    ratedAt: {
        type: Date,
        default: Date.now
    }
}, {
    /**
     * Schema Options
     *
     * timestamps: Adds createdAt and updatedAt for audit trail
     * toJSON: Renames _id to ratingId for API consistency
     */
    timestamps: true,
    toJSON: createToJSONOptions('ratingId')
});

/**
 * Compound Index: One Rating Per User Per Work
 *
 * Ensures a user can only have one rating for each work.
 * Prevents duplicate ratings and enables efficient upsert operations.
 *
 * Query optimization:
 * - Fast lookup: "What did user X rate work Y?"
 * - Enables updateOne with upsert for create-or-update pattern
 */
ratingSchema.index({ userId: 1, workId: 1 }, { unique: true });

// Create and export model
const Rating = mongoose.model('Rating', ratingSchema);

export default Rating;
