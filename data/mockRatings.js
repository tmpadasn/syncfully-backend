export const mockRatings = [
    {
        id: 1,
        userId: 2,
        workId: 1,
        score: 4.5,
        ratedAt: '2025-01-10T10:00:00Z'
    },
    {
        id: 2,
        userId: 2,
        workId: 2,
        score: 5.0,
        ratedAt: '2025-01-11T14:30:00Z'
    },
    {
        id: 3,
        userId: 3,
        workId: 1,
        score: 3.5,
        ratedAt: '2025-01-09T08:15:00Z'
    },
    {
        id: 4,
        userId: 3,
        workId: 3,
        score: 4.0,
        ratedAt: '2025-01-12T16:45:00Z'
    }
];

let nextRatingId = 5;

export const getNextRatingId = () => nextRatingId++;
