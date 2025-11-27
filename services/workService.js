import Work from '../models/Work.js';
import { mockWorks, getNextWorkId } from '../data/mockWorks.js';
import { mockRatings } from '../data/mockRatings.js';
import { isMongoConnected } from '../config/database.js';
import { calculateAverageRating, enrichWorkWithRating, safeParseInt } from '../utils/helpers.js';
import { buildImageUrl } from '../utils/imageHelpers.js';
import { devLog } from '../utils/logger.js';
import { getWorkAverageRating } from './ratingService.js';
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
    if (isMongoConnected()) {
        const work = await Work.findById(workId);
        if (!work) return null;

        const workData = work.toJSON();
        const ratingData = await getWorkAverageRating(workId);
        workData.rating = ratingData.averageRating;
        workData.coverUrl = buildImageUrl(workData.coverUrl, workData.type);

        return workData;
    }

    // Use mock data
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
    if (isMongoConnected()) {
        const query = {};

        if (filters.type) {
            query.type = filters.type;
        }

        if (filters.year) {
            query.year = { $gte: Number(filters.year) }; // Changed to >= for "from year onwards"
        }

        if (filters.genres && filters.genres.length > 0) {
            query.genres = { $in: filters.genres };
        }

        const works = await Work.find(query);

        // Enrich with ratings using the rating service
        const enrichedWorks = await Promise.all(
            works.map(async (work) => {
                const workData = work.toJSON();
                const ratingData = await getWorkAverageRating(work._id);
                workData.rating = ratingData.averageRating;
                return workData;
            })
        );

        return enrichedWorks;
    }

    // Use mock data
    let works = [...mockWorks];

    devLog('Total works before filtering:', works.length);

    // Apply type filter
    if (filters.type) {
        devLog('Filtering by type:', filters.type);
        works = works.filter(w => w.type === filters.type);
        devLog('Works after type filter:', works.length);
    }

    // Apply year filter
    if (filters.year) {
        devLog('Filtering by year:', filters.year);
        const yearInt = Number(filters.year);
        works = works.filter(w => w.year >= yearInt); // Changed to >= for "from year onwards"
        devLog('Works after year filter:', works.length);
    }

    // Apply genres filter
    if (filters.genres && filters.genres.length > 0) {
        devLog('Filtering by genres:', filters.genres);
        works = works.filter(w =>
            w.genres && w.genres.some(g => filters.genres.includes(g))
        );
        devLog('Works after genres filter:', works.length);
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

    if (isMongoConnected()) {
        // Find works with same type or overlapping genres
        const similar = await Work.find({
            _id: { $ne: workId },
            $or: [
                { type: work.type },
                { genres: { $in: work.genres } }
            ]
        }).limit(QUERY_LIMITS.SIMILAR_WORKS);

        // Enrich with ratings
        const enrichedSimilar = await Promise.all(
            similar.map(async (w) => {
                const workData = w.toJSON();
                const ratingData = await getWorkAverageRating(w._id);
                workData.rating = ratingData.averageRating;
                return workData;
            })
        );

        return enrichedSimilar;
    }

    // Use mock data - find works with same type or genres
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
    if (isMongoConnected()) {
        // Get works and enrich with rating data, then sort by popularity
        const works = await Work.find().limit(QUERY_LIMITS.POPULAR_WORKS_FETCH);

        const worksWithRatings = await Promise.all(
            works.map(async (w) => {
                const workData = w.toJSON();
                const ratingData = await getWorkAverageRating(w._id);
                workData.rating = ratingData.averageRating;
                workData.ratingsCount = ratingData.totalRatings;
                return workData;
            })
        );

        // Sort by rating and number of ratings
        return worksWithRatings
            .sort((a, b) => {
                if (b.rating !== a.rating) return b.rating - a.rating;
                return b.ratingsCount - a.ratingsCount;
            })
            .slice(0, QUERY_LIMITS.POPULAR_WORKS);
    }

    // Use mock data - sort by rating
    const worksWithRatings = mockWorks.map(work => {
        const workRatings = mockRatings.filter(r => r.workId === work.id);
        const rating = calculateAverageRating(workRatings);
        const enrichedWork = enrichWorkWithRating(work, mockRatings);
        enrichedWork.ratingsCount = workRatings.length;
        return enrichedWork;
    });

    // Sort by rating and number of ratings
    return worksWithRatings
        .sort((a, b) => {
            if (b.rating !== a.rating) return b.rating - a.rating;
            return b.ratingsCount - a.ratingsCount;
        })
        .slice(0, QUERY_LIMITS.POPULAR_WORKS);
};

/**
 * Create new work
 * @param {Object} workData - Work data
 * @returns {Promise<Object>}
 */
export const createWork = async (workData) => {
    if (isMongoConnected()) {
        const work = new Work(workData);
        await work.save();

        const result = work.toJSON();
        const ratingData = await getWorkAverageRating(work._id);
        result.rating = ratingData.averageRating;
        return result;
    }

    // Use mock data
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
    if (isMongoConnected()) {
        const work = await Work.findByIdAndUpdate(
            workId,
            updateData,
            { new: true, runValidators: true }
        );

        if (!work) return null;

        const result = work.toJSON();
        const ratingData = await getWorkAverageRating(workId);
        result.rating = ratingData.averageRating;
        return result;
    }

    // Use mock data
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
    if (isMongoConnected()) {
        const result = await Work.findByIdAndDelete(workId);
        return result !== null;
    }

    // Use mock data
    const parsedId = safeParseInt(workId, 'workId');
    const workIndex = mockWorks.findIndex(w => w.id === parsedId);
    if (workIndex === -1) return false;

    mockWorks.splice(workIndex, 1);
    return true;
};
