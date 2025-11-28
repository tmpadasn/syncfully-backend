import mongoose from 'mongoose';
import { WORK_TYPES, GENRES } from '../config/constants.js';
import { createToJSONOptions } from '../utils/modelHelpers.js';

const workSchema = new mongoose.Schema({
    title: {
        type: String,
        required: [true, 'Title is required'],
        trim: true
    },
    description: {
        type: String,
        trim: true
    },
    type: {
        type: String,
        required: [true, 'Type is required'],
        enum: Object.values(WORK_TYPES)
    },
    year: {
        type: Number,
        min: [1900, 'Year must be 1900 or later'],
        max: [new Date().getFullYear() + 5, 'Year cannot be too far in the future']
    },
    genres: {
        type: [String],
        validate: {
            validator: function (arr) {
                return arr.every(genre => GENRES.includes(genre));
            },
            message: 'Invalid genre provided'
        }
    },
    creator: {
        type: String,
        trim: true
    },
    coverUrl: {
        type: String,
        trim: true
    },
    foundAt: {
        type: String,
        trim: true
    }
}, {
    timestamps: true,
    toJSON: createToJSONOptions('workId', [], true) // Include virtuals for rating
});

/**
 * Virtual for average rating
 * Note: This will be calculated from ratings collection
 */
workSchema.virtual('rating').get(function () {
    return this._rating || 0;
});

const Work = mongoose.model('Work', workSchema);

export default Work;
