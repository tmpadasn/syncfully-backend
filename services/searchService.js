// services/searchService.js
import mongoose from 'mongoose';
import Work from '../models/Work.js';
import User from '../models/User.js';

// 🔹 Adjust these imports if your mocks are exported differently
// If your files do `export default [...]` this is correct.
// If they do `export const mockWorks = [...]`, change accordingly.
import { mockWorks } from '../data/mockWorks.js';
import { mockUsers } from '../data/mockUsers.js';
import { mockRatings } from '../data/mockRatings.js';
import { calculateAverageRating, formatWorkData } from '../utils/helpers.js';

const MAX_RESULTS = 50;

// Helper function to calculate rating for a work from mock data
const calculateWorkRating = (workId) => {
    const ratingsForWork = mockRatings.filter(
        (r) => String(r.workId) === String(workId)
    );
    return calculateAverageRating(ratingsForWork.map(r => ({ score: r.score })));
};

// Helper function to format work with rating and count
const formatWorkWithRating = (work) => {
    const id = work.workId || work._id || work.id;
    const ratingsForWork = mockRatings.filter(
        (r) => String(r.workId) === String(id)
    );
    const rating = calculateAverageRating(ratingsForWork.map(r => ({ score: r.score })));

    return {
        workId: id,
        title: work.title,
        description: work.description,
        type: work.type,
        year: work.year,
        genres: work.genres,
        creator: work.creator,
        coverUrl: work.coverUrl,
        foundAt: work.foundAt,
        rating,
        ratingCount: ratingsForWork.length,
        createdAt: work.createdAt,
        updatedAt: work.updatedAt
    };
};

// Helper function to format user data
const formatUserData = (user) => {
    const id = user.userId || user._id || user.id;
    
    let ratedWorksCount = 0;
    if (user.ratedWorks && typeof user.ratedWorks === 'object') {
        ratedWorksCount = Object.keys(user.ratedWorks).length;
    }

    return {
        userId: id,
        username: user.username,
        email: user.email,
        profilePictureUrl: user.profilePictureUrl,
        ratedWorks: user.ratedWorks,
        ratedWorksCount,
        createdAt: user.createdAt,
        updatedAt: user.updatedAt
    };
};

// Helper function to sort works by rating and title
const sortWorksByRating = (works) => {
    return works.sort((a, b) => b.rating - a.rating || a.title.localeCompare(b.title));
};

const isDbConnected = () => mongoose.connection.readyState === 1;

/* ------------------------ WORKS: DB implementation ------------------------ */

const searchWorksDb = async ({ query, workType, genre, minRating, year }) => {
    const match = {};

    if (query && query.trim()) {
        const q = query.trim();
        match.$or = [
            { title: { $regex: q, $options: 'i' } },
            { description: { $regex: q, $options: 'i' } },
            { creator: { $regex: q, $options: 'i' } }
        ];
    }

    if (workType) {
        match.type = workType;
    }

    if (genre) {
        match.genres = genre;
    }

    if (typeof year === 'number') {
        match.year = { $gte: year }; // Changed from exact match to >= (from year onwards)
    }

    const pipeline = [
        { $match: match },
        {
            $lookup: {
                from: 'ratings',
                localField: '_id',
                foreignField: 'workId',
                as: 'ratings'
            }
        },
        {
            $addFields: {
                rating: {
                    $cond: [
                        { $gt: [{ $size: '$ratings' }, 0] },
                        { $avg: '$ratings.score' },
                        null
                    ]
                },
                ratingCount: { $size: '$ratings' }
            }
        }
    ];

    if (typeof minRating === 'number') {
        pipeline.push({
            $match: {
                rating: { $ne: null, $gte: minRating }
            }
        });
    }

    pipeline.push(
        { $sort: { rating: -1, title: 1 } },
        { $limit: MAX_RESULTS },
        {
            $project: {
                _id: 0,
                workId: '$_id',
                title: 1,
                description: 1,
                type: 1,
                year: 1,
                genres: 1,
                creator: 1,
                coverUrl: 1,
                foundAt: 1,
                rating: { $ifNull: ['$rating', 0] },
                ratingCount: 1,
                createdAt: 1,
                updatedAt: 1
            }
        }
    );

    const works = await Work.aggregate(pipeline);
    return works;
};

/* ----------------------- WORKS: mock implementation ---------------------- */

const searchWorksMock = ({ query, workType, genre, minRating, year }) => {
    let works = [...mockWorks];

    if (query && query.trim()) {
        const q = query.trim().toLowerCase();
        works = works.filter((w) => {
            const title = (w.title || '').toLowerCase();
            const description = (w.description || '').toLowerCase();
            const creator = (w.creator || '').toLowerCase();
            return (
                title.includes(q) ||
                description.includes(q) ||
                creator.includes(q)
            );
        });
    }

    if (workType) {
        works = works.filter((w) => w.type === workType);
    }

    if (genre) {
        works = works.filter(
            (w) => Array.isArray(w.genres) && w.genres.includes(genre)
        );
    }

    if (typeof year === 'number') {
        works = works.filter((w) => w.year >= year);
    }

    // Format all works with ratings
    const withRatings = works.map(formatWorkWithRating);

    // Filter by minimum rating if specified
    const filtered = typeof minRating === 'number'
        ? withRatings.filter((w) => w.rating >= minRating)
        : withRatings;

    // Sort and limit results
    return sortWorksByRating(filtered).slice(0, MAX_RESULTS);
};


/* ------------------------ USERS: DB implementation ----------------------- */

const searchUsersDb = async ({ query }) => {
    const filter = {};

    if (query && query.trim()) {
        const q = query.trim();
        filter.$or = [
            { username: { $regex: q, $options: 'i' } },
            { email: { $regex: q, $options: 'i' } }
        ];
    }

    const users = await User.find(filter)
        .sort({ username: 1 })
        .limit(MAX_RESULTS);

    return users.map((u) => u.toJSON());
};

/* ----------------------- USERS: mock implementation ---------------------- */

const searchUsersMock = ({ query }) => {
    let users = [...mockUsers];

    // text search on username/email (case-insensitive)
    if (query && query.trim()) {
        const q = query.trim().toLowerCase();
        users = users.filter((u) => {
            const username = (u.username || '').toLowerCase();
            const email = (u.email || '').toLowerCase();
            return username.includes(q) || email.includes(q);
        });
    }

    return users
        .sort((a, b) => (a.username || '').localeCompare(b.username || ''))
        .slice(0, MAX_RESULTS)
        .map(formatUserData);
};

/* --------------------------- Public functions --------------------------- */

export const searchWorks = (params) => {
    if (isDbConnected()) {
        return searchWorksDb(params);
    }
    return Promise.resolve(searchWorksMock(params));
};

export const searchUsers = (params) => {
    if (isDbConnected()) {
        return searchUsersDb(params);
    }
    return Promise.resolve(searchUsersMock(params));
};

export const searchItems = async ({
    query,
    itemType,
    workType,
    genre,
    minRating,
    year
}) => {
    const normalizedItemType = itemType ? itemType.toLowerCase() : undefined;

    if (normalizedItemType === 'work') {
        const works = await searchWorks({ query, workType, genre, minRating, year });
        return { works, users: [] };
    }

    if (normalizedItemType === 'user') {
        const users = await searchUsers({ query });
        return { works: [], users };
    }

    const [works, users] = await Promise.all([
        searchWorks({ query, workType, genre, minRating, year }),
        searchUsers({ query })
    ]);

    return { works, users };
};

export default {
    searchWorks,
    searchUsers,
    searchItems
};
