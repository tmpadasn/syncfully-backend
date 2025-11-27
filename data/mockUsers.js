import { mockRatings } from './mockRatings.js';

// Helper function to build ratedWorks object for a user from mockRatings
const buildRatedWorksForUser = (userId) => {
    const userRatings = mockRatings.filter(rating => rating.userId === userId);
    const ratedWorks = {};
    
    userRatings.forEach(rating => {
        ratedWorks[rating.workId] = {
            score: rating.score,
            ratedAt: rating.ratedAt
        };
    });
    
    return ratedWorks;
};

export const mockUsers = [
    {
        id: 1,
        username: 'alice',
        email: 'alice@example.com',
        password: 'alice',
        profilePictureUrl: 'http://localhost:3000/uploads/profiles/profile_picture.jpg',
        ratedWorks: buildRatedWorksForUser(1),
        recommendationVersion: Date.now()
    },
    {
        id: 2,
        username: 'bob',
        email: 'bob@example.com',
        password: 'bob',
        profilePictureUrl: 'http://localhost:3000/uploads/profiles/profile_picture.jpg',
        ratedWorks: buildRatedWorksForUser(2),
        recommendationVersion: Date.now()
    },
    {
        id: 3,
        username: 'carol',
        email: 'carol@example.com',
        password: 'carol',
        profilePictureUrl: 'http://localhost:3000/uploads/profiles/profile_picture.jpg',
        ratedWorks: buildRatedWorksForUser(3),
        recommendationVersion: Date.now()
    },
    {
        id: 4,
        username: 'david',
        email: 'david@example.com',
        password: 'david',
        profilePictureUrl: 'http://localhost:3000/uploads/profiles/profile_picture.jpg',
        ratedWorks: buildRatedWorksForUser(4),
        recommendationVersion: Date.now()
    },
    {
        id: 5,
        username: 'emma',
        email: 'emma@example.com',
        password: 'emma',
        profilePictureUrl: 'http://localhost:3000/uploads/profiles/profile_picture.jpg',
        ratedWorks: buildRatedWorksForUser(5),
        recommendationVersion: Date.now()
    },
    {
        id: 6,
        username: 'frank',
        email: 'frank@example.com',
        password: 'frank',
        profilePictureUrl: 'http://localhost:3000/uploads/profiles/profile_picture.jpg',
        ratedWorks: buildRatedWorksForUser(6),
        recommendationVersion: Date.now()
    },
    {
        id: 7,
        username: 'grace',
        email: 'grace@example.com',
        password: 'grace',
        profilePictureUrl: 'http://localhost:3000/uploads/profiles/profile_picture.jpg',
        ratedWorks: buildRatedWorksForUser(7),
        recommendationVersion: Date.now()
    },
    {
        id: 8,
        username: 'henry',
        email: 'henry@example.com',
        password: 'henry',
        profilePictureUrl: 'http://localhost:3000/uploads/profiles/profile_picture.jpg',
        ratedWorks: buildRatedWorksForUser(8),
        recommendationVersion: Date.now()
    },
    {
        id: 9,
        username: 'iris',
        email: 'iris@example.com',
        password: 'iris',
        profilePictureUrl: 'http://localhost:3000/uploads/profiles/profile_picture.jpg',
        ratedWorks: buildRatedWorksForUser(9),
        recommendationVersion: Date.now()
    },
    {
        id: 10,
        username: 'jack',
        email: 'jack@example.com',
        password: 'jack',
        profilePictureUrl: 'http://localhost:3000/uploads/profiles/profile_picture.jpg',
        ratedWorks: buildRatedWorksForUser(10),
        recommendationVersion: Date.now()
    }
];

let nextUserId = 11;

export const getNextUserId = () => nextUserId++;
