import { mockWorks, getNextWorkId } from '../data/mockWorks.js';
import { mockRatings } from '../data/mockRatings.js';
import { enrichWorkWithRating, safeParseInt } from '../utils/helpers.js';
import { buildImageUrl } from '../utils/imageHelpers.js';
import { devLog } from '../utils/logger.js';

import { QUERY_LIMITS } from '../config/constants.js';

/**
 * Helper: Find mock work by ID
 * @param {number|string} workId - Work ID
 * @returns {Object|null} Work object or null
 */
const findMockWorkById = (workId) => {
    const parsedId = safeParseInt(workId, 'workId');
    return mockWorks.find(w => w.id === parsedId) || null;
};

/**
 * Get work by ID
 * @param {number|string} workId - Work ID
 * @returns {Promise<Object|null>}
 */
export const getWorkById = async (workId) => {
    const work = findMockWorkById(workId);
    if (!work) return null;

    const enrichedWork = enrichWorkWithRating(work, mockRatings);
    enrichedWork.coverUrl = buildImageUrl(work.coverUrl, work.type);

    return enrichedWork;
};

/**
 * Get all works
 * @param {Object} filters - Filter options
 * @returns {Promise<Array>}
 */
export const getAllWorks = async (filters = {}) => {
    let works = [...mockWorks];

    if (filters.type) works = works.filter(w => w.type === filters.type);
    if (filters.year) works = works.filter(w => w.year >= Number(filters.year));
    if (filters.genres?.length) {
        works = works.filter(w => w.genres?.some(g => filters.genres.includes(g)));
    }

    return works.map(work => enrichWorkWithRating(work, mockRatings));
};

/**
 * Get similar works
 * @param {number|string} workId - Work ID
 * @returns {Promise<Array>}
 */
export const getSimilarWorks = async (workId) => {
    const work = await getWorkById(workId);
    if (!work) return null;

    const parsedId = safeParseInt(workId, 'workId');
    const similar = mockWorks
        .filter(w =>
            w.id !== parsedId &&
            (w.type === work.type || (w.genres && w.genres.some(g => work.genres && work.genres.includes(g))))
        )
        .slice(0, QUERY_LIMITS.SIMILAR_WORKS);

    return similar.map(w => enrichWorkWithRating(w, mockRatings));
};

/**
 * Get popular works (this week)
 * @returns {Promise<Array>}
 */
export const getPopularWorks = async () => {
    const all = await getAllWorks();
    const popular = all
        .filter(w => w.rating >= 4 && w.ratingCount >= 3)
        .sort((a, b) => b.rating - a.rating || b.ratingCount - a.ratingCount)
        .slice(0, QUERY_LIMITS.POPULAR_WORKS_FETCH);

    return popular
        .sort(() => Math.random() - 0.5)
        .slice(0, QUERY_LIMITS.POPULAR_WORKS);
};

/**
 * Create new work
 * @param {Object} workData - Work data
 * @returns {Promise<Object>}
 */
export const createWork = async (workData) => {
    const newWork = {
        id: getNextWorkId(),
        ...workData
    };

    mockWorks.push(newWork);

    return {
        workId: newWork.id,
        ...workData,
        rating: 0
    };
};

/**
 * Update work
 * @param {number|string} workId - Work ID
 * @param {Object} updateData - Data to update
 * @returns {Promise<Object|null>}
 */
export const updateWork = async (workId, updateData) => {
    const parsedId = safeParseInt(workId, 'workId');
    const workIndex = mockWorks.findIndex(w => w.id === parsedId);
    if (workIndex === -1) return null;

    mockWorks[workIndex] = { ...mockWorks[workIndex], ...updateData };

    return enrichWorkWithRating(mockWorks[workIndex], mockRatings);
};

/**
 * Delete work
 * @param {number|string} workId - Work ID
 * @returns {Promise<boolean>}
 */
export const deleteWork = async (workId) => {
    const parsedId = safeParseInt(workId, 'workId');
    const workIndex = mockWorks.findIndex(w => w.id === parsedId);
    if (workIndex === -1) return false;

    mockWorks.splice(workIndex, 1);
    return true;
};
