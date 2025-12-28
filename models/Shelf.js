/**
 * Shelf Model
 *
 * Mongoose schema for user-created collections of works.
 * Like playlists but for movies/books/music - organizes works into lists.
 * NOTE: Currently not used - application runs with mock data only.
 */

import mongoose from 'mongoose';
import { createToJSONOptions } from '../utils/modelHelpers.js';

/**
 * Shelf Schema Definition
 *
 * Represents a user's custom collection of works.
 * Examples: "To Watch", "Favorites", "Summer Reading List"
 *
 * Features:
 * - User-owned (each shelf belongs to one user)
 * - Named collections with optional descriptions
 * - Contains references to Work documents
 * - Unique names per user (can't have two "Favorites" shelves)
 */
const shelfSchema = new mongoose.Schema({
    /**
     * User ID - shelf owner
     *
     * References User model.
     * Required - shelves must belong to a user.
     * Used in compound index for unique shelf names per user.
     */
    userId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User',
        required: [true, 'User ID is required']
    },

    /**
     * Name - shelf title
     *
     * Required, user-facing identifier for the shelf.
     * Constraints:
     * - Auto-trimmed
     * - 1-50 characters
     * - Must be unique per user (enforced by compound index)
     *
     * Examples: "Want to Read", "Top 10 Movies", "Workout Playlist"
     */
    name: {
        type: String,
        required: [true, 'Shelf name is required'],
        trim: true,
        minlength: [1, 'Shelf name cannot be empty'],
        maxlength: [50, 'Shelf name cannot exceed 50 characters']
    },

    /**
     * Description - optional shelf description
     *
     * Allows users to add context about the shelf's purpose.
     * Constraints:
     * - Auto-trimmed
     * - Max 500 characters
     * - Defaults to empty string
     *
     * Example: "Books recommended by friends that I want to read this year"
     */
    description: {
        type: String,
        trim: true,
        maxlength: [500, 'Description cannot exceed 500 characters'],
        default: ''
    },

    /**
     * Works - array of work references
     *
     * Contains ObjectIds referencing Work documents.
     * Allows shelf population with full work details.
     * Order is preserved (insertion order maintained).
     *
     * Implementation notes:
     * - Empty array by default (new shelves start empty)
     * - No uniqueness constraint (could add same work twice)
     * - Consider Set if uniqueness needed in future
     */
    works: {
        type: [mongoose.Schema.Types.ObjectId],
        ref: 'Work',
        default: []
    }
}, {
    /**
     * Schema Options
     *
     * timestamps: Auto-adds createdAt and updatedAt
     * toJSON: Renames _id to shelfId for API consistency
     */
    timestamps: true,
    toJSON: createToJSONOptions('shelfId')
});

/**
 * Compound Index: Unique Shelf Names Per User
 *
 * Prevents users from creating multiple shelves with the same name.
 * Different users CAN have shelves with the same name (e.g., "Favorites").
 *
 * Query optimization:
 * - Fast lookup: "Get user X's shelf named Y"
 * - Enforces business rule at database level
 */
shelfSchema.index({ userId: 1, name: 1 }, { unique: true });

// Create and export model
export default mongoose.model('Shelf', shelfSchema);
