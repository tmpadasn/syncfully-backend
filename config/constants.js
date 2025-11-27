export const WORK_TYPES = {
    MOVIE: 'movie',
    SERIES: 'series',
    MUSIC: 'music',
    BOOK: 'book',
    GRAPHIC_NOVEL: 'graphic-novel'
};

export const RATING_CONSTRAINTS = {
    MIN: 1,
    MAX: 5,
    STEP: 1  // Only integer ratings allowed
};

export const USER_CONSTRAINTS = {
    USERNAME_MIN_LENGTH: 3,
    USERNAME_MAX_LENGTH: 20,
    PASSWORD_MIN_LENGTH: 6
};

export const HTTP_STATUS = {
    OK: 200,
    CREATED: 201,
    NO_CONTENT: 204,
    BAD_REQUEST: 400,
    UNAUTHORIZED: 401,
    NOT_FOUND: 404,
    INTERNAL_SERVER_ERROR: 500
};

export const GENRES = [
    'Action',
    'Adventure',
    'Comedy',
    'Drama',
    'Fantasy',
    'Horror',
    'Mystery',
    'Romance',
    'Sci-Fi',
    'Thriller',
    'Documentary',
    'Animation',
    'Crime',
    'Biography',
    'History'
];
