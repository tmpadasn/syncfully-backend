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

const MAX_RESULTS = 50;

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
        match.year = year;
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

// services/searchService.js (inside searchWorksMock)
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
        works = works.filter((w) => w.year === year);
    }

    const withRatings = works.map((w) => {
        const id = w.workId || w._id || w.id;

        const ratingsForWork = mockRatings.filter(
            (r) => String(r.workId) === String(id)
        );
        const ratingCount = ratingsForWork.length;
        const rating =
            ratingCount === 0
                ? 0
                : ratingsForWork.reduce((sum, r) => sum + (r.score || 0), 0) /
                  ratingCount;

        return {
            workId: id,
            title: w.title,
            description: w.description,
            type: w.type,
            year: w.year,
            genres: w.genres,
            creator: w.creator,
            coverUrl: w.coverUrl,
            foundAt: w.foundAt,
            rating,
            ratingCount,
            createdAt: w.createdAt,
            updatedAt: w.updatedAt
        };
    });

    if (typeof minRating === 'number') {
        return withRatings
            .filter((w) => w.rating >= minRating)
            .sort((a, b) => b.rating - a.rating || a.title.localeCompare(b.title))
            .slice(0, MAX_RESULTS);
    }

    return withRatings
        .sort((a, b) => b.rating - a.rating || a.title.localeCompare(b.title))
        .slice(0, MAX_RESULTS);
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
        .map((u) => {
            const id = u.userId || u._id || u.id; // 👈 for your mocks this will be u.id

            // ratedWorks is a plain object in mocks
            let ratedWorksCount = 0;
            if (u.ratedWorks && typeof u.ratedWorks === 'object') {
                ratedWorksCount = Object.keys(u.ratedWorks).length;
            }

            return {
                userId: id,                 // 👈 public API field
                username: u.username,
                email: u.email,
                profilePictureUrl: u.profilePictureUrl,
                ratedWorks: u.ratedWorks,
                ratedWorksCount,
                createdAt: u.createdAt,
                updatedAt: u.updatedAt
            };
        });
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
