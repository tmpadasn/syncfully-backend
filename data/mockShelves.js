/**
 * @fileoverview Mock Shelf Data
 * @description In-memory mock data for user shelf collections.
 *
 * Shelves are user-created collections for organizing works (similar to playlists).
 * Each shelf belongs to a single user and can contain multiple work IDs.
 *
 * Data Structure:
 * - id: Unique shelf identifier (auto-incremented)
 * - userId: Owner of the shelf (references mockUsers)
 * - name: Display name of the shelf
 * - description: Optional description of shelf contents
 * - works: Array of work IDs contained in this shelf
 * - createdAt: Timestamp when shelf was created
 * - updatedAt: Timestamp of last modification
 *
 * @module data/mockShelves
 * @see services/shelfService - Business logic for shelf operations
 */

// =============================================================================
// MOCK SHELF DATA
// =============================================================================

/**
 * Mock shelf collection data.
 * Contains sample shelves for 10 users with various genres and themes.
 * Work IDs reference entries in mockWorks.js.
 *
 * @type {Array<Object>}
 */
export const mockShelves = [
    // -------------------------------------------------------------------------
    // Alice's shelves (userId: 1)
    // -------------------------------------------------------------------------
    {
        id: 1,
        userId: 1,
        name: 'Drama Favorites',
        description: 'My favorite dramatic films and shows',
        works: [1, 2, 11, 20, 28, 45],  // Work IDs from mockWorks
        createdAt: new Date('2024-01-15'),
        updatedAt: new Date('2024-11-20')
    },
    {
        id: 2,
        userId: 1,
        name: 'Romantic Reads',
        description: 'Books that touched my heart',
        works: [51, 55, 60, 65],
        createdAt: new Date('2024-02-01'),
        updatedAt: new Date('2024-10-15')
    },

    // -------------------------------------------------------------------------
    // Bob's shelves (userId: 2)
    // -------------------------------------------------------------------------
    {
        id: 3,
        userId: 2,
        name: 'Action Packed',
        description: 'Best action movies and series',
        works: [3, 8, 14, 22, 30, 38, 42],
        createdAt: new Date('2024-01-20'),
        updatedAt: new Date('2024-11-10')
    },
    {
        id: 4,
        userId: 2,
        name: 'Sci-Fi Collection',
        description: 'Science fiction favorites',
        works: [10, 25, 36, 40, 48, 86, 90],
        createdAt: new Date('2024-03-05'),
        updatedAt: new Date('2024-11-05')
    },

    // Carol's shelves (userId: 3)
    {
        id: 5,
        userId: 3,
        name: 'Fantasy Worlds',
        description: 'Magical adventures and fantasy tales',
        works: [12, 52, 56, 87, 91, 95],
        createdAt: new Date('2024-02-10'),
        updatedAt: new Date('2024-11-12')
    },
    {
        id: 6,
        userId: 3,
        name: 'Adventure Time',
        description: 'Thrilling adventures',
        works: [15, 24, 39, 43, 58, 100],
        createdAt: new Date('2024-04-01'),
        updatedAt: new Date('2024-10-20')
    },

    // David's shelves (userId: 4)
    {
        id: 7,
        userId: 4,
        name: 'Crime & Mystery',
        description: 'The best detective stories and crime thrillers',
        works: [13, 18, 27, 37, 44, 62],
        createdAt: new Date('2024-01-25'),
        updatedAt: new Date('2024-11-08')
    },
    {
        id: 8,
        userId: 4,
        name: 'Thriller Collection',
        description: 'Edge of your seat experiences',
        works: [19, 23, 31, 41, 49, 92],
        createdAt: new Date('2024-03-15'),
        updatedAt: new Date('2024-10-30')
    },

    // Emma's shelves (userId: 5)
    {
        id: 9,
        userId: 5,
        name: 'Comedy Gold',
        description: 'Laughs and good times',
        works: [16, 21, 26, 32, 46, 67],
        createdAt: new Date('2024-02-20'),
        updatedAt: new Date('2024-11-15')
    },
    {
        id: 10,
        userId: 5,
        name: 'Feel Good Romance',
        description: 'Romantic comedies and love stories',
        works: [17, 29, 51, 55, 68, 72],
        createdAt: new Date('2024-04-10'),
        updatedAt: new Date('2024-11-01')
    },

    // Frank's shelves (userId: 6)
    {
        id: 11,
        userId: 6,
        name: 'Sci-Fi & Fantasy',
        description: 'Futuristic and magical worlds',
        works: [10, 25, 36, 52, 87, 91],
        createdAt: new Date('2024-01-30'),
        updatedAt: new Date('2024-11-18')
    },
    {
        id: 12,
        userId: 6,
        name: 'Animation Classics',
        description: 'Best animated films and series',
        works: [33, 47, 59, 88, 96],
        createdAt: new Date('2024-03-20'),
        updatedAt: new Date('2024-10-25')
    },

    // Grace's shelves (userId: 7)
    {
        id: 13,
        userId: 7,
        name: 'Biography & History',
        description: 'Real stories from real people',
        works: [34, 53, 57, 61, 66, 70],
        createdAt: new Date('2024-02-15'),
        updatedAt: new Date('2024-11-22')
    },
    {
        id: 14,
        userId: 7,
        name: 'Documentary Collection',
        description: 'Educational and eye-opening documentaries',
        works: [54, 63, 64, 69],
        createdAt: new Date('2024-05-01'),
        updatedAt: new Date('2024-11-10')
    },

    // Henry's shelves (userId: 8)
    {
        id: 15,
        userId: 8,
        name: 'Horror Favorites',
        description: 'Scary and suspenseful horror',
        works: [35, 50, 89, 93, 97],
        createdAt: new Date('2024-03-01'),
        updatedAt: new Date('2024-11-20')
    },
    {
        id: 16,
        userId: 8,
        name: 'Thriller & Suspense',
        description: 'Keep you on the edge',
        works: [13, 19, 23, 31, 41, 92],
        createdAt: new Date('2024-04-15'),
        updatedAt: new Date('2024-10-28')
    },

    // Iris's shelves (userId: 9)
    {
        id: 17,
        userId: 9,
        name: 'Animation Collection',
        description: 'Animated movies and shows I love',
        works: [33, 47, 59, 88, 94, 96],
        createdAt: new Date('2024-02-25'),
        updatedAt: new Date('2024-11-16')
    },
    {
        id: 18,
        userId: 9,
        name: 'Adventure Picks',
        description: 'Exciting adventures for all ages',
        works: [15, 24, 39, 43, 58, 98, 100],
        createdAt: new Date('2024-05-10'),
        updatedAt: new Date('2024-11-05')
    },

    // Jack's shelves (userId: 10)
    {
        id: 19,
        userId: 10,
        name: 'Action Heroes',
        description: 'Ultimate action movie collection',
        works: [3, 8, 14, 22, 30, 38, 42],
        createdAt: new Date('2024-01-10'),
        updatedAt: new Date('2024-11-24')
    },
    {
        id: 20,
        userId: 10,
        name: 'Adventure & Sci-Fi',
        description: 'Adventures in space and beyond',
        works: [10, 15, 25, 36, 40, 48, 99],
        createdAt: new Date('2024-03-25'),
        updatedAt: new Date('2024-11-14')
    }
];

let nextShelfId = Math.max(...mockShelves.map(s => s.id)) + 1;

export const getNextShelfId = () => {
    return nextShelfId++;
};
