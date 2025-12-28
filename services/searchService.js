import { mockWorks } from '../data/mockWorks.js';
import { mockUsers } from '../data/mockUsers.js';
import { mockRatings } from '../data/mockRatings.js';
import { calculateAverageRating } from '../utils/helpers.js';

const MAX_RESULTS = 50;

/**
 * Helper: Calculate rating for a work from mock data
 * @param {number|string} workId - Work ID
 * @returns {number} Average rating
 */
const calculateWorkRating = (workId) => {
    const ratingsForWork = mockRatings.filter(
        (r) => String(r.workId) === String(workId)
    );
    return calculateAverageRating(ratingsForWork.map(r => ({ score: r.score })));
};

/**
 * Helper: Format work with rating and count
 * @param {Object} work - Work object
 * @returns {Object} Formatted work with rating
 */
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

/**
 * Helper: Format user data
 * @param {Object} user - User object
 * @returns {Object} Formatted user data
 */
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

/**
 * Helper: Sort works by rating and title
 * @param {Array} works - Works array
 * @returns {Array} Sorted works
 */
const sortWorksByRating = (works) => {
    return works.sort((a, b) => b.rating - a.rating || a.title.localeCompare(b.title));
};

/**
 * Search works
 * @param {Object} params - Search parameters
 * @returns {Promise<Array>}
 */
export const searchWorks = async ({ query, workType, genre, minRating, year }) => {
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

/**
 * Search users
 * @param {Object} params - Search parameters
 * @returns {Promise<Array>}
 */
export const searchUsers = async ({ query }) => {
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

/**
 * Search items (works and/or users)
 * @param {Object} params - Search parameters
 * @returns {Promise<Object>}
 */
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
