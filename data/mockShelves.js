export const mockShelves = [
    {
        id: 1,
        userId: 1,
        name: 'To Watch',
        description: 'Movies and series I want to watch',
        works: [1, 3, 5],
        createdAt: new Date('2024-01-15'),
        updatedAt: new Date('2024-01-15')
    },
    {
        id: 2,
        userId: 1,
        name: 'Favorites',
        description: 'My all-time favorite works',
        works: [1, 4, 7],
        createdAt: new Date('2024-01-20'),
        updatedAt: new Date('2024-01-20')
    },
    {
        id: 3,
        userId: 1,
        name: 'Currently Reading',
        description: 'Books I am currently reading',
        works: [10, 12],
        createdAt: new Date('2024-02-01'),
        updatedAt: new Date('2024-02-05')
    },
    {
        id: 4,
        userId: 2,
        name: 'Best Of 2024',
        description: 'Best works released in 2024',
        works: [3, 8],
        createdAt: new Date('2024-02-10'),
        updatedAt: new Date('2024-02-10')
    }
];

let nextShelfId = Math.max(...mockShelves.map(s => s.id)) + 1;

export const getNextShelfId = () => {
    return nextShelfId++;
};
