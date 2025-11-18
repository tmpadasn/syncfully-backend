export const mockWorks = [
    {
        id: 1,
        title: 'The Lord of the Rings: The Fellowship of the Ring',
        description: 'A meek Hobbit from the Shire and eight companions set out on a journey to destroy the powerful One Ring and save Middle-earth from the Dark Lord Sauron.',
        type: 'movie',
        year: 2001,
        genres: ['Adventure', 'Drama', 'Fantasy'],
        creator: 'Peter Jackson',
        coverUrl: 'https://example.com/covers/lotr1.jpg',
        foundAt: 'https://www.imdb.com/title/tt0120737/'
    },
    {
        id: 2,
        title: 'The Catcher in the Rye',
        description: 'A story about teenage angst and alienation.',
        type: 'book',
        year: 1951,
        genres: ['Drama', 'Coming-of-age'],
        creator: 'J.D. Salinger',
        coverUrl: 'https://example.com/covers/catcher.jpg',
        foundAt: 'https://amazon.com/catcher-in-the-rye'
    },
    {
        id: 3,
        title: 'Breaking Bad',
        description: 'A high school chemistry teacher turned methamphetamine manufacturer partners with a former student.',
        type: 'series',
        year: 2008,
        genres: ['Crime', 'Drama', 'Thriller'],
        creator: 'Vince Gilligan',
        coverUrl: 'https://example.com/covers/breaking-bad.jpg',
        foundAt: 'https://www.netflix.com/title/70143836'
    },
    {
        id: 4,
        title: 'Dark Side of the Moon',
        description: 'Progressive rock album exploring themes of conflict, greed, time, and mental illness.',
        type: 'music',
        year: 1973,
        genres: ['Progressive Rock', 'Psychedelic Rock'],
        creator: 'Pink Floyd',
        coverUrl: 'https://example.com/covers/dark-side.jpg',
        foundAt: 'https://open.spotify.com/album/4LH4d3cOWNNsVw41Gqt2kv'
    },
    {
        id: 5,
        title: '1984',
        description: 'A dystopian social science fiction novel and cautionary tale about the dangers of totalitarianism.',
        type: 'book',
        year: 1949,
        genres: ['Dystopian', 'Science Fiction', 'Political Fiction'],
        creator: 'George Orwell',
        coverUrl: 'https://example.com/covers/1984.jpg',
        foundAt: 'https://amazon.com/1984-George-Orwell'
    },
    {
        id: 6,
        title: 'Inception',
        description: 'A thief who steals corporate secrets through dream-sharing technology is given the inverse task of planting an idea.',
        type: 'movie',
        year: 2010,
        genres: ['Action', 'Sci-Fi', 'Thriller'],
        creator: 'Christopher Nolan',
        coverUrl: 'https://example.com/covers/inception.jpg',
        foundAt: 'https://www.imdb.com/title/tt1375666/'
    },
    {
        id: 7,
        title: 'Stranger Things',
        description: 'When a young boy disappears, his mother, a police chief and his friends must confront terrifying supernatural forces.',
        type: 'series',
        year: 2016,
        genres: ['Drama', 'Fantasy', 'Horror'],
        creator: 'The Duffer Brothers',
        coverUrl: 'https://example.com/covers/stranger-things.jpg',
        foundAt: 'https://www.netflix.com/title/80057281'
    },
    {
        id: 8,
        title: 'Abbey Road',
        description: 'The eleventh studio album by The Beatles.',
        type: 'music',
        year: 1969,
        genres: ['Rock', 'Pop'],
        creator: 'The Beatles',
        coverUrl: 'https://example.com/covers/abbey-road.jpg',
        foundAt: 'https://open.spotify.com/album/0ETFjACtuP2ADo6LFhL6HN'
    },
    {
        id: 9,
        title: 'Watchmen',
        description: 'A complex tale of superheroes, human nature, and the Cold War.',
        type: 'graphic-novel',
        year: 1987,
        genres: ['Superhero', 'Mystery', 'Drama'],
        creator: 'Alan Moore',
        coverUrl: 'https://example.com/covers/watchmen.jpg',
        foundAt: 'https://amazon.com/Watchmen-Alan-Moore'
    },
    {
        id: 10,
        title: 'The Matrix',
        description: 'A computer hacker learns about the true nature of his reality and his role in the war against its controllers.',
        type: 'movie',
        year: 1999,
        genres: ['Action', 'Sci-Fi'],
        creator: 'The Wachowskis',
        coverUrl: 'https://example.com/covers/matrix.jpg',
        foundAt: 'https://www.imdb.com/title/tt0133093/'
    }
];

let nextWorkId = 11;

export const getNextWorkId = () => nextWorkId++;
