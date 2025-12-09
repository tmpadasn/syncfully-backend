import test from 'ava';
import got from 'got';
import listen from 'test-listen';
import http from 'http';
import app from '../app.js';

test.before(async (t) => {
    t.context.server = http.createServer(app);
    t.context.prefixUrl = await listen(t.context.server);
    t.context.got = got.extend({ prefixUrl: t.context.prefixUrl, responseType: 'json' });
});

test.after.always((t) => {
    t.context.server.close();
});

// GET /api/search
test('GET /api/search returns all works and users without filters (Happy Path 1)', async (t) => {
    const { body } = await t.context.got('api/search');

    t.true(body.success);
    t.truthy(body.data);
    t.true(Array.isArray(body.data.works));
    t.true(Array.isArray(body.data.users));
    t.is(typeof body.data.totalWorks, 'number');
    t.is(typeof body.data.totalUsers, 'number');
});

test('GET /api/search filters by query string (Happy Path 2)', async (t) => {
    const { body } = await t.context.got('api/search?query=lord');

    t.true(body.success);
    t.true(Array.isArray(body.data.works));
    // Should find works with "lord" in title or description
    if (body.data.works.length > 0) {
        const hasLord = body.data.works.some(work => 
            work.title.toLowerCase().includes('lord') || 
            work.description.toLowerCase().includes('lord')
        );
        t.true(hasLord);
    }
});

test('GET /api/search filters by item-type=work (Happy Path 3)', async (t) => {
    const { body } = await t.context.got('api/search?item-type=work');

    t.true(body.success);
    t.true(Array.isArray(body.data.works));
    t.true(body.data.works.length > 0);
    t.is(body.data.users.length, 0); // Should not return users
});

test('GET /api/search filters by item-type=user (Happy Path 4)', async (t) => {
    const { body } = await t.context.got('api/search?item-type=user');

    t.true(body.success);
    t.true(Array.isArray(body.data.users));
    t.true(body.data.users.length > 0);
    t.is(body.data.works.length, 0); // Should not return works
});

test('GET /api/search filters by work-type (Happy Path 5)', async (t) => {
    const { body } = await t.context.got('api/search?work-type=movie');

    t.true(body.success);
    t.true(Array.isArray(body.data.works));
    // All returned works should be movies
    body.data.works.forEach(work => {
        t.is(work.type, 'movie');
    });
});

test('GET /api/search filters by genre (Happy Path 6)', async (t) => {
    const { body } = await t.context.got('api/search?genre=Action');

    t.true(body.success);
    t.true(Array.isArray(body.data.works));
    // All returned works should have Action genre
    body.data.works.forEach(work => {
        t.true(work.genres.includes('Action'));
    });
});

test('GET /api/search filters by minimum rating (Happy Path 7)', async (t) => {
    const { body } = await t.context.got('api/search?rating=4.0');

    t.true(body.success);
    t.true(Array.isArray(body.data.works));
    // All returned works should have rating >= 4.0
    body.data.works.forEach(work => {
        if (work.rating !== undefined && work.rating !== null) {
            t.true(work.rating >= 4.0);
        }
    });
});

test('GET /api/search filters by year (Happy Path 8)', async (t) => {
    const { body } = await t.context.got('api/search?year=2020');

    t.true(body.success);
    t.true(Array.isArray(body.data.works));
    // All returned works should be from 2020 or later
    body.data.works.forEach(work => {
        t.true(work.year >= 2020);
    });
});

test('GET /api/search combines multiple filters (Happy Path 9)', async (t) => {
    const { body } = await t.context.got('api/search?item-type=work&work-type=movie&genre=Action&rating=3.0');

    t.true(body.success);
    t.true(Array.isArray(body.data.works));
    t.is(body.data.users.length, 0);

    // All returned works should match all filters
    body.data.works.forEach(work => {
        t.is(work.type, 'movie');
        t.true(work.genres.includes('Action'));
        if (work.rating !== undefined && work.rating !== null) {
            t.true(work.rating >= 3.0);
        }
    });
});

test('GET /api/search returns empty results when no matches (Happy Path 10)', async (t) => {
    const { body } = await t.context.got('api/search?query=nonexistentwork12345xyz');

    t.true(body.success);
    t.is(body.data.works.length, 0);
    t.is(body.data.totalWorks, 0);
});

test('GET /api/search searches users by username (Happy Path 11)', async (t) => {
    const { body } = await t.context.got('api/search?item-type=user&query=alice');

    t.true(body.success);
    t.true(Array.isArray(body.data.users));
    
    if (body.data.users.length > 0) {
        const hasAlice = body.data.users.some(user => 
            user.username.toLowerCase().includes('alice')
        );
        t.true(hasAlice);
    }
});

test('GET /api/search includes work rating information (Happy Path 12)', async (t) => {
    const { body } = await t.context.got('api/search?item-type=work');

    t.true(body.success);
    
    if (body.data.works.length > 0) {
        const work = body.data.works[0];
        t.truthy(work.workId);
        t.truthy(work.title);
        t.true('rating' in work);
        t.true('ratingCount' in work);
    }
});

test('GET /api/search includes user information (Happy Path 13)', async (t) => {
    const { body } = await t.context.got('api/search?item-type=user');

    t.true(body.success);
    
    if (body.data.users.length > 0) {
        const user = body.data.users[0];
        t.truthy(user.userId);
        t.truthy(user.username);
        t.truthy(user.email);
    }
});

test('GET /api/search fails with invalid item-type (Unhappy Path 1)', async (t) => {
    try {
        await t.context.got('api/search?item-type=invalid');
        t.fail('Should have thrown an error');
    } catch (error) {
        t.is(error.response.statusCode, 400);
        t.regex(error.response.body.error, /invalid item-type/i);
    }
});

test('GET /api/search fails with invalid rating (Unhappy Path 2)', async (t) => {
    try {
        await t.context.got('api/search?rating=invalid');
        t.fail('Should have thrown an error');
    } catch (error) {
        t.is(error.response.statusCode, 400);
        t.regex(error.response.body.error, /invalid rating/i);
    }
});

test('GET /api/search fails with invalid year (Unhappy Path 3)', async (t) => {
    try {
        await t.context.got('api/search?year=notayear');
        t.fail('Should have thrown an error');
    } catch (error) {
        t.is(error.response.statusCode, 400);
        t.regex(error.response.body.error, /invalid year/i);
    }
});

test('GET /api/search handles case-insensitive item-type (Edge Case 1)', async (t) => {
    const { body } = await t.context.got('api/search?item-type=WORK');

    t.true(body.success);
    t.true(Array.isArray(body.data.works));
    t.is(body.data.users.length, 0);
});

test('GET /api/search handles case-insensitive work-type (Edge Case 2)', async (t) => {
    const { body } = await t.context.got('api/search?work-type=MOVIE');

    t.true(body.success);
    t.true(Array.isArray(body.data.works));
});

test('GET /api/search handles rating as integer (Edge Case 3)', async (t) => {
    const { body } = await t.context.got('api/search?rating=4');

    t.true(body.success);
    t.true(Array.isArray(body.data.works));
});

test('GET /api/search handles rating as decimal (Edge Case 4)', async (t) => {
    const { body } = await t.context.got('api/search?rating=4.5');

    t.true(body.success);
    t.true(Array.isArray(body.data.works));
});

test('GET /api/search returns metadata with counts (Edge Case 5)', async (t) => {
    const { body } = await t.context.got('api/search');

    t.true(body.success);
    t.is(body.data.totalWorks, body.data.works.length);
    t.is(body.data.totalUsers, body.data.users.length);
});

test('GET /api/search with query and work-type together (Edge Case 6)', async (t) => {
    const { body } = await t.context.got('api/search?query=the&work-type=movie');

    t.true(body.success);
    t.true(Array.isArray(body.data.works));
    
    body.data.works.forEach(work => {
        t.is(work.type, 'movie');
        const matchesQuery = 
            work.title.toLowerCase().includes('the') || 
            work.description.toLowerCase().includes('the');
        t.true(matchesQuery);
    });
});

test('GET /api/search with all filters combined (Edge Case 7)', async (t) => {
    const { body } = await t.context.got('api/search?query=action&item-type=work&work-type=movie&genre=Action&rating=3&year=2000');

    t.true(body.success);
    t.true(Array.isArray(body.data.works));
    t.is(body.data.users.length, 0);
});
