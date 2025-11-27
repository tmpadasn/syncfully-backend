import mongoose from 'mongoose';
import bcrypt from 'bcrypt';

const userSchema = new mongoose.Schema({
    username: {
        type: String,
        required: [true, 'Username is required'],
        unique: true,
        trim: true,
        minlength: [3, 'Username must be at least 3 characters long'],
        maxlength: [20, 'Username cannot exceed 20 characters']
    },
    email: {
        type: String,
        required: [true, 'Email is required'],
        unique: true,
        lowercase: true,
        trim: true,
        match: [/^\S+@\S+\.\S+$/, 'Please provide a valid email address']
    },
    password: {
        type: String,
        required: [true, 'Password is required'],
        minlength: [6, 'Password must be at least 6 characters long']
    },
    profilePictureUrl: {
        type: String,
        default: null
    },
    ratedWorks: {
        type: Map,
        of: {
            score: {
                type: Number,
                required: true,
                min: 0.5,
                max: 5
            },
            ratedAt: {
                type: Date,
                default: Date.now
            }
        },
        default: new Map()
    },
    followers: [{
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User'
    }],
    following: [{
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User'
    }]
}, {
    timestamps: true,
    toJSON: {
        transform: function (doc, ret) {
            ret.userId = ret._id;
            delete ret._id;
            delete ret.__v;
            delete ret.password;

            // Convert ratedWorks Map to object for JSON response
            if (ret.ratedWorks instanceof Map) {
                ret.ratedWorks = Object.fromEntries(ret.ratedWorks);
            }

            return ret;
        }
    }
});

/**
 * Hash password before saving
 */
userSchema.pre('save', async function (next) {
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
 * Compare password method
 * @param {string} candidatePassword - Password to compare
 * @returns {Promise<boolean>}
 */
userSchema.methods.comparePassword = async function (candidatePassword) {
    return await bcrypt.compare(candidatePassword, this.password);
};

/**
 * Get number of rated works
 * @returns {number}
 */
userSchema.virtual('ratedWorksCount').get(function () {
    return this.ratedWorks ? this.ratedWorks.size : 0;
});

const User = mongoose.model('User', userSchema);

export default User;
