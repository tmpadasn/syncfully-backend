import mongoose from 'mongoose';
import { createToJSONOptions } from '../utils/modelHelpers.js';

const shelfSchema = new mongoose.Schema({
    userId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User',
        required: [true, 'User ID is required']
    },
    name: {
        type: String,
        required: [true, 'Shelf name is required'],
        trim: true,
        minlength: [1, 'Shelf name cannot be empty'],
        maxlength: [50, 'Shelf name cannot exceed 50 characters']
    },
    description: {
        type: String,
        trim: true,
        maxlength: [500, 'Description cannot exceed 500 characters'],
        default: ''
    },
    works: {
        type: [mongoose.Schema.Types.ObjectId],
        ref: 'Work',
        default: []
    }
}, {
    timestamps: true,
    toJSON: createToJSONOptions('shelfId')
});

// Compound index to ensure unique shelf names per user
shelfSchema.index({ userId: 1, name: 1 }, { unique: true });

export default mongoose.model('Shelf', shelfSchema);
