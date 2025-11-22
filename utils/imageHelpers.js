/**
 * Get base URL for images
 */
export const getImageBaseUrl = () => {
    return process.env.IMAGE_BASE_URL || 'http://localhost:3000/uploads';
};

/**
 * Get placeholder image URL
 * @param {string} type - Type of placeholder (cover, profile)
 * @returns {string}
 */
export const getPlaceholderImage = (type) => {
    const baseUrl = getImageBaseUrl();

    const placeholders = {
        cover: `${baseUrl}/placeholders/default-cover.jpg`,
        profile: `${baseUrl}/placeholders/default-profile.jpg`,
        movie: `${baseUrl}/placeholders/movie-placeholder.jpg`,
        book: `${baseUrl}/placeholders/book-placeholder.jpg`,
        music: `${baseUrl}/placeholders/music-placeholder.jpg`,
        series: `${baseUrl}/placeholders/series-placeholder.jpg`,
        'graphic-novel': `${baseUrl}/placeholders/graphic-novel-placeholder.jpg`
    };

    return placeholders[type] || placeholders.cover;
};

/**
 * Build full image URL
 * @param {string} path - Image path
 * @param {string} fallbackType - Type for fallback placeholder
 * @returns {string}
 */
export const buildImageUrl = (path, fallbackType = 'cover') => {
    if (!path) return getPlaceholderImage(fallbackType);

    // If already a full URL, return as is
    if (path.startsWith('http://') || path.startsWith('https://')) {
        return path;
    }

    // Build full URL
    const baseUrl = getImageBaseUrl();
    return `${baseUrl}/${path}`;
};
