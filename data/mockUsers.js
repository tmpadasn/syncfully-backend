export const mockUsers = [
    {
        id: 1,
        username: 'spiros',
        email: 'spiros@example.com',
        password: '$2b$10$YourHashedPasswordHere', // hashed 'password123'
        profilePictureUrl: 'https://example.com/uploads/profiles/1.jpg',
        ratedWorks: {}
    },
    {
        id: 2,
        username: 'maria',
        email: 'maria@example.com',
        password: '$2b$10$YourHashedPasswordHere',
        profilePictureUrl: 'https://example.com/uploads/profiles/2.jpg',
        ratedWorks: {
            1: { score: 4.5, ratedAt: '2025-01-10T10:00:00Z' },
            2: { score: 5.0, ratedAt: '2025-01-11T14:30:00Z' }
        }
    },
    {
        id: 3,
        username: 'john',
        email: 'john@example.com',
        password: '$2b$10$YourHashedPasswordHere',
        profilePictureUrl: null,
        ratedWorks: {
            1: { score: 3.5, ratedAt: '2025-01-09T08:15:00Z' },
            3: { score: 4.0, ratedAt: '2025-01-12T16:45:00Z' }
        }
    }
];

let nextUserId = 4;

export const getNextUserId = () => nextUserId++;
