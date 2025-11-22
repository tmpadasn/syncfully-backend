export const mockWorks = [
    {
        id: 1,
        title: 'The Lord of the Rings: The Return of the King',
        description: 'Gandalf and Aragorn lead the World of Men against Sauron\'s army to draw his gaze from Frodo and Sam as they approach Mount Doom with the One Ring.',
        type: 'movie',
        year: 2003,
        genres: ['Adventure', 'Drama', 'Fantasy'],
        creator: 'Peter Jackson',
        coverUrl: 'http://localhost:3000/uploads/covers/lord_of_the-rings.jpg',
        foundAt: 'https://www.imdb.com/title/tt0167260/'
    },
    {
        id: 2,
        title: 'Airplane!',
        description: 'A man afraid to fly must ensure that a plane lands safely after the pilots become sick.',
        type: 'movie',
        year: 1980,
        genres: ['Comedy'],
        creator: 'Jim Abrahams, David Zucker, Jerry Zucker',
        coverUrl: 'http://localhost:3000/uploads/covers/airplane.jpg',
        foundAt: 'https://www.imdb.com/title/tt0080339/'
    },
    {
        id: 3,
        title: 'Anora',
        description: 'Anora, a young sex worker from Brooklyn, gets her chance at a Cinderella story when she meets and impulsively marries the son of an oligarch.',
        type: 'movie',
        year: 2024,
        genres: ['Drama', 'Romance', 'Comedy'],
        creator: 'Sean Baker',
        coverUrl: 'http://localhost:3000/uploads/covers/anora.jpg',
        foundAt: 'https://www.imdb.com/title/tt28607951/'
    },
    {
        id: 4,
        title: 'The Dark Side of the Moon',
        description: 'The eighth studio album by Pink Floyd, exploring themes of conflict, greed, time, death, and mental illness.',
        type: 'music',
        year: 1973,
        genres: ['Progressive Rock', 'Psychedelic Rock'],
        creator: 'Pink Floyd',
        coverUrl: 'http://localhost:3000/uploads/covers/pink_floyd_1.jpg',
        foundAt: 'https://open.spotify.com/album/4LH4d3cOWNNsVw41Gqt2kv'
    },
    {
        id: 5,
        title: 'Meddle',
        description: 'The sixth studio album by Pink Floyd, featuring the epic 23-minute track "Echoes" and showcasing the band\'s experimental approach.',
        type: 'music',
        year: 1971,
        genres: ['Progressive Rock', 'Psychedelic Rock', 'Art Rock'],
        creator: 'Pink Floyd',
        coverUrl: 'http://localhost:3000/uploads/covers/pink_floyd_2.jpg',
        foundAt: 'https://open.spotify.com/album/468ZwCchVtzEbt9BHUTcPm'
    },
    {
        id: 6,
        title: 'Crime and Punishment',
        description: 'A psychological thriller exploring the mental anguish and moral dilemmas of Rodion Raskolnikov, an impoverished ex-student who formulates a plan to kill a corrupt pawnbroker.',
        type: 'book',
        year: 1866,
        genres: ['Psychological Fiction', 'Crime', 'Philosophical Fiction'],
        creator: 'Fyodor Dostoevsky',
        coverUrl: 'http://localhost:3000/uploads/covers/crime_and_punishment.jpg',
        foundAt: 'https://www.goodreads.com/book/show/7144.Crime_and_Punishment'
    },
    {
        id: 7,
        title: 'Mezzanine',
        description: 'The third studio album by Massive Attack, known for its pioneering trip-hop sound and atmospheric production.',
        type: 'music',
        year: 1998,
        genres: ['Trip Hop', 'Electronic', 'Downtempo'],
        creator: 'Massive Attack',
        coverUrl: 'http://localhost:3000/uploads/covers/mezzanine.png',
        foundAt: 'https://open.spotify.com/album/5jzvI8CbCeUJkD2nGLBUVX'
    },
    {
        id: 8,
        title: 'Pulp Fiction',
        description: 'The lives of two mob hitmen, a boxer, a gangster and his wife intertwine in four tales of violence and redemption.',
        type: 'movie',
        year: 1994,
        genres: ['Crime', 'Drama', 'Thriller'],
        creator: 'Quentin Tarantino',
        coverUrl: 'http://localhost:3000/uploads/covers/pulp_fiction.jpg',
        foundAt: 'https://www.imdb.com/title/tt0110912/'
    },
    {
        id: 9,
        title: 'War and Peace',
        description: 'Epic Russian novel chronicling the French invasion of Russia and its impact on Tsarist society, through the stories of five aristocratic families.',
        type: 'book',
        year: 1869,
        genres: ['Historical Fiction', 'War', 'Romance', 'Philosophy'],
        creator: 'Leo Tolstoy',
        coverUrl: 'http://localhost:3000/uploads/covers/war_and_peace.jpg',
        foundAt: 'https://www.goodreads.com/book/show/656.War_and_Peace'
    },
    {
        id: 10,
        title: 'Harry Potter and the Deathly Hallows: Part 2',
        description: 'Harry, Ron, and Hermione search for Voldemort\'s remaining Horcruxes in their effort to destroy the Dark Lord as the final battle rages on at Hogwarts.',
        type: 'movie',
        year: 2011,
        genres: ['Adventure', 'Fantasy', 'Mystery'],
        creator: 'David Yates',
        coverUrl: 'http://localhost:3000/uploads/covers/harry_potter_2.jpg',
        foundAt: 'https://www.imdb.com/title/tt1201607/'
    }
];

let nextWorkId = 11;

export const getNextWorkId = () => nextWorkId++;
