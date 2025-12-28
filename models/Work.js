/**
 * Work Model
 *
 * Mongoose schema for media works (movies, books, music, series, graphic novels).
 * Represents any rateable content in the system.
 * NOTE: Currently not used - application runs with mock data only.
 */

import mongoose from 'mongoose';
import { WORK_TYPES, GENRES } from '../config/constants.js';
import { createToJSONOptions } from '../utils/modelHelpers.js';

/**
 * Work Schema Definition
 *
 * Stores information about media works including:
 * - Basic metadata (title, description, creator)
 * - Classification (type, year, genres)
 * - Media resources (cover image)
 * - Discovery metadata (where the work can be found)
 *
 * Ratings are stored separately in the Rating collection.
 */
const workSchema = new mongoose.Schema({
    /**
     * Title - name of the work
     *
     * Required field, auto-trimmed.
     * Examples: "Inception", "1984", "Dark Side of the Moon"
     */
    title: {
        type: String,
        required: [true, 'Title is required'],
        trim: true
    },

    /**
     * Description - synopsis or summary
     *
     * Optional text field for plot summary or overview.
     * Auto-trimmed to remove excess whitespace.
     */
    description: {
        type: String,
        trim: true
    },

    /**
     * Type - category of media
     *
     * Required field validated against WORK_TYPES constant.
     * Valid values: 'movie', 'series', 'music', 'book', 'graphic-novel'
     * Determines how work is displayed and filtered.
     */
    type: {
        type: String,
        required: [true, 'Type is required'],
        enum: Object.values(WORK_TYPES)
    },

    /**
     * Year - release/publication year
     *
     * Optional field with sensible bounds:
     * - Minimum: 1900 (cinema/recording era)
     * - Maximum: current year + 5 (allows upcoming releases)
     */
    year: {
        type: Number,
        min: [1900, 'Year must be 1900 or later'],
        max: [new Date().getFullYear() + 5, 'Year cannot be too far in the future']
    },

    /**
     * Genres - array of genre tags
     *
     * Optional array validated against GENRES constant.
     * Allows multiple genres per work (e.g., ["Action", "Sci-Fi"]).
     * Custom validator ensures all genres are from approved list.
     */
    genres: {
        type: [String],
        validate: {
            validator: function (arr) {
                // All genres must be in the approved GENRES list
                return arr.every(genre => GENRES.includes(genre));
            },
            message: 'Invalid genre provided'
        }
    },

    /**
     * Creator - author/director/artist name
     *
     * Optional field for attribution.
     * Examples: "Christopher Nolan", "Pink Floyd", "George Orwell"
     */
    creator: {
        type: String,
        trim: true
    },

    /**
     * Cover URL - path to cover image
     *
     * Stores relative path to uploaded cover image.
     * Combined with IMAGE_BASE_URL to form complete URL.
     * Used for displaying work thumbnails in UI.
     */
    coverUrl: {
        type: String,
        trim: true
    },

    /**
     * Found At - where to watch/read/listen
     *
     * Optional field for platform/service information.
     * Examples: "Netflix", "Spotify", "Local Library"
     * Helps users discover where to access the work.
     */
    foundAt: {
        type: String,
        trim: true
    }
}, {
    /**
     * Schema Options
     *
     * timestamps: Auto-creates createdAt and updatedAt fields
     * toJSON: Uses helper to rename _id to workId and include virtuals
     */
    timestamps: true,
    toJSON: createToJSONOptions('workId', [], true) // Include virtuals for rating
});

/**
 * Virtual Property: Rating
 *
 * Computed property for average rating.
 * Not stored in database - calculated from Rating collection.
 * Returns 0 by default if no rating has been attached.
 *
 * Usage: Populated by service layer after aggregating ratings.
 * Set via work._rating before toJSON() to include in response.
 *
 * @returns {number} Average rating (0-5) or 0 if not calculated
 */
workSchema.virtual('rating').get(function () {
    return this._rating || 0;
});

// Create and export model
const Work = mongoose.model('Work', workSchema);

export default Work;
