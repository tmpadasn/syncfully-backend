import { mockWorks } from '../data/mockWorks.js';
import { mockUsers } from '../data/mockUsers.js';
import { mockRatings } from '../data/mockRatings.js';
import { calculateAverageRating } from '../utils/helpers.js';

const MAX_RESULTS = 50;

/**
 * Helper: Format work with rating and count
 * @param {Object} work - Work object
 * @returns {Object} Formatted work with rating
 */
const formatWorkWithRating = (work) => {
    const id = work.workId || work._id || work.id;
    const ratingsForWork = mockRatings.filter(r => String(r.workId) === String(id));

    return {
        ...work,
        workId: id,
        rating: calculateAverageRating(ratingsForWork.map(r => ({ score: r.score }))),
        ratingCount: ratingsForWork.length
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
 * Helper: Apply filters to works array
 * @param {Array} works - Works array
 * @param {Object} filters - Filter options
 * @returns {Array} Filtered works
 */
const applyWorkFilters = (works, { query, workType, genre, year }) => {
    let filtered = works;

    if (query?.trim()) {
        const q = query.trim().toLowerCase();
        filtered = filtered.filter(w =>
            (w.title || '').toLowerCase().includes(q) ||
            (w.description || '').toLowerCase().includes(q) ||
            (w.creator || '').toLowerCase().includes(q)
        );
    }

    if (workType) filtered = filtered.filter(w => w.type === workType);
    if (genre) filtered = filtered.filter(w => w.genres?.includes(genre));
    if (typeof year === 'number') filtered = filtered.filter(w => w.year >= year);

    return filtered;
};

/**
 * Search works
 * @param {Object} params - Search parameters
 * @returns {Promise<Array>}
 */
export const searchWorks = async ({ query, workType, genre, minRating, year }) => {
    const works = applyWorkFilters([...mockWorks], { query, workType, genre, year });
    const withRatings = works.map(formatWorkWithRating);
    const filtered = typeof minRating === 'number'
        ? withRatings.filter(w => w.rating >= minRating)
        : withRatings;

    return filtered
        .sort((a, b) => b.rating - a.rating || a.title.localeCompare(b.title))
        .slice(0, MAX_RESULTS);
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
export const searchItems = async ({ query, itemType, workType, genre, minRating, year }) => {
    const type = itemType?.toLowerCase();

    const searches = {
        work: async () => ({ works: await searchWorks({ query, workType, genre, minRating, year }), users: [] }),
        user: async () => ({ works: [], users: await searchUsers({ query }) }),
        default: async () => {
            const [works, users] = await Promise.all([
                searchWorks({ query, workType, genre, minRating, year }),
                searchUsers({ query })
            ]);
            return { works, users };
        }
    };

    return (searches[type] || searches.default)();
};

export default {
    searchWorks,
    searchUsers,
    searchItems
};
