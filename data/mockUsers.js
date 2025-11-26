export const mockUsers = [
    {
        id: 1,
        username: 'alice',
        email: 'alice@example.com',
        password: 'alice',
        profilePictureUrl: 'http://localhost:3000/uploads/profiles/profile_picture.jpg',
        ratedWorks: {}
    },
    {
        id: 2,
        username: 'bob',
        email: 'bob@example.com',
        password: 'bob',
        profilePictureUrl: 'http://localhost:3000/uploads/profiles/profile_picture.jpg',
        ratedWorks: {}
    },
    {
        id: 3,
        username: 'carol',
        email: 'carol@example.com',
        password: 'carol',
        profilePictureUrl: 'http://localhost:3000/uploads/profiles/profile_picture.jpg',
        ratedWorks: {}
    },
    {
        id: 4,
        username: 'david',
        email: 'david@example.com',
        password: 'david',
        profilePictureUrl: 'http://localhost:3000/uploads/profiles/profile_picture.jpg',
        ratedWorks: {}
    },
    {
        id: 5,
        username: 'emma',
        email: 'emma@example.com',
        password: 'emma',
        profilePictureUrl: 'http://localhost:3000/uploads/profiles/profile_picture.jpg',
        ratedWorks: {}
    },
    {
        id: 6,
        username: 'frank',
        email: 'frank@example.com',
        password: 'frank',
        profilePictureUrl: 'http://localhost:3000/uploads/profiles/profile_picture.jpg',
        ratedWorks: {}
    },
    {
        id: 7,
        username: 'grace',
        email: 'grace@example.com',
        password: 'grace',
        profilePictureUrl: 'http://localhost:3000/uploads/profiles/profile_picture.jpg',
        ratedWorks: {}
    },
    {
        id: 8,
        username: 'henry',
        email: 'henry@example.com',
        password: 'henry',
        profilePictureUrl: 'http://localhost:3000/uploads/profiles/profile_picture.jpg',
        ratedWorks: {}
    },
    {
        id: 9,
        username: 'iris',
        email: 'iris@example.com',
        password: 'iris',
        profilePictureUrl: 'http://localhost:3000/uploads/profiles/profile_picture.jpg',
        ratedWorks: {}
    },
    {
        id: 10,
        username: 'jack',
        email: 'jack@example.com',
        password: 'jack',
        profilePictureUrl: 'http://localhost:3000/uploads/profiles/profile_picture.jpg',
        ratedWorks: {}
    }
];

let nextUserId = 11;

export const getNextUserId = () => nextUserId++;
