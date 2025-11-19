import mongoose from 'mongoose';
import { RATING_CONSTRAINTS } from '../config/constants.js';

const ratingSchema = new mongoose.Schema({
    userId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User',
        required: [true, 'User ID is required']
    },
    workId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Work',
        required: [true, 'Work ID is required']
    },
    score: {
        type: Number,
        required: [true, 'Score is required'],
        min: [RATING_CONSTRAINTS.MIN, `Score must be at least ${RATING_CONSTRAINTS.MIN}`],
        max: [RATING_CONSTRAINTS.MAX, `Score must not exceed ${RATING_CONSTRAINTS.MAX}`]
    },
    ratedAt: {
        type: Date,
        default: Date.now
    }
}, {
    timestamps: true,
    toJSON: {
        transform: function (doc, ret) {
            ret.ratingId = ret._id;
            delete ret._id;
            delete ret.__v;
            return ret;
        }
    }
});

// Compound index to ensure one rating per user per work
ratingSchema.index({ userId: 1, workId: 1 }, { unique: true });

const Rating = mongoose.model('Rating', ratingSchema);

export default Rating;
