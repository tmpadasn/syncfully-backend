import Work from '../models/Work.js';
import { mockWorks, getNextWorkId } from '../data/mockWorks.js';
import { mockRatings } from '../data/mockRatings.js';
import { isMongoConnected } from '../config/database.js';
import { calculateAverageRating } from '../utils/helpers.js';
import { buildImageUrl } from '../utils/imageHelpers.js';
import { devLog } from '../utils/logger.js';

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
        workData.rating = 0;
        workData.coverUrl = buildImageUrl(workData.coverUrl, workData.type);

        return workData;
    }

    // Use mock data
    const work = mockWorks.find(w => w.id === parseInt(workId));
    if (!work) return null;

    const workRatings = mockRatings.filter(r => r.workId === parseInt(workId));
    const rating = calculateAverageRating(workRatings);

    return {
        workId: work.id,
        title: work.title,
        description: work.description,
        type: work.type,
        year: work.year,
        genres: work.genres,
        creator: work.creator,
        rating,
        coverUrl: buildImageUrl(work.coverUrl, work.type), // Use helper
        foundAt: work.foundAt
    };
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
            query.year = { $gte: parseInt(filters.year) }; // Changed to >= for "from year onwards"
        }

        if (filters.genres && filters.genres.length > 0) {
            query.genres = { $in: filters.genres };
        }

        const works = await Work.find(query);

        return works.map(work => {
            const workData = work.toJSON();
            workData.rating = 0; // TODO: Calculate from ratings
            return workData;
        });
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
        works = works.filter(w => w.year >= parseInt(filters.year)); // Changed to >= for "from year onwards"
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

    return works.map(work => {
        const workRatings = mockRatings.filter(r => r.workId === work.id);
        const rating = calculateAverageRating(workRatings);

        return {
            workId: work.id,
            title: work.title,
            description: work.description,
            type: work.type,
            year: work.year,
            genres: work.genres,
            creator: work.creator,
            rating,
            coverUrl: work.coverUrl,
            foundAt: work.foundAt
        };
    });
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
        }).limit(10);

        return similar.map(w => {
            const workData = w.toJSON();
            workData.rating = 0; // TODO: Calculate from ratings
            return workData;
        });
    }

    // Use mock data - find works with same type or genres
    const similar = mockWorks
        .filter(w =>
            w.id !== parseInt(workId) &&
            (w.type === work.type || (w.genres && w.genres.some(g => work.genres && work.genres.includes(g))))
        )
        .slice(0, 10);

    return similar.map(w => {
        const workRatings = mockRatings.filter(r => r.workId === w.id);
        const rating = calculateAverageRating(workRatings);

        return {
            workId: w.id,
            title: w.title,
            description: w.description,
            type: w.type,
            year: w.year,
            genres: w.genres,
            creator: w.creator,
            rating,
            coverUrl: w.coverUrl,
            foundAt: w.foundAt
        };
    });
};

/**
 * Get popular works (this week)
 * @returns {Promise<Array>}
 */
export const getPopularWorks = async () => {
    if (isMongoConnected()) {
        // TODO: Implement based on recent ratings count/average
        const works = await Work.find().limit(10);

        return works.map(w => {
            const workData = w.toJSON();
            workData.rating = 0;
            return workData;
        });
    }

    // Use mock data - sort by rating
    const worksWithRatings = mockWorks.map(work => {
        const workRatings = mockRatings.filter(r => r.workId === work.id);
        const rating = calculateAverageRating(workRatings);

        return {
            workId: work.id,
            title: work.title,
            description: work.description,
            type: work.type,
            year: work.year,
            genres: work.genres,
            creator: work.creator,
            rating,
            coverUrl: work.coverUrl,
            foundAt: work.foundAt,
            ratingsCount: workRatings.length
        };
    });

    // Sort by rating and number of ratings
    return worksWithRatings
        .sort((a, b) => {
            if (b.rating !== a.rating) return b.rating - a.rating;
            return b.ratingsCount - a.ratingsCount;
        })
        .slice(0, 10);
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
        result.rating = 0;
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
        result.rating = 0;
        return result;
    }

    // Use mock data
    const workIndex = mockWorks.findIndex(w => w.id === parseInt(workId));
    if (workIndex === -1) return null;

    mockWorks[workIndex] = { ...mockWorks[workIndex], ...updateData };

    const workRatings = mockRatings.filter(r => r.workId === parseInt(workId));
    const rating = calculateAverageRating(workRatings);

    return {
        workId: mockWorks[workIndex].id,
        ...mockWorks[workIndex],
        rating
    };
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
    const workIndex = mockWorks.findIndex(w => w.id === parseInt(workId));
    if (workIndex === -1) return false;

    mockWorks.splice(workIndex, 1);
    return true;
};
