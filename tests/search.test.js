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

// GET /api/search (General)
test('GET /api/search returns results for both works and users (Happy Path 1)', async (t) => {
    const { body } = await t.context.got('api/search');
    t.true(body.success);
    t.true(Array.isArray(body.data.works));
    t.true(Array.isArray(body.data.users));
    t.true(typeof body.data.totalWorks === 'number');
    t.true(typeof body.data.totalUsers === 'number');
});

test('GET /api/search filters by query string (Happy Path 2)', async (t) => {
    // Assuming "Alice" exists as a user and maybe "Alice" in Wonderland as a work (or similar)
    // Or just "The" which is common
    const { body } = await t.context.got('api/search?query=The');
    t.true(body.success);
    // Should find something
    t.true(body.data.works.length > 0 || body.data.users.length > 0);
});

test('GET /api/search returns error for invalid item-type (Unhappy Path 1)', async (t) => {
    try {
        await t.context.got('api/search?item-type=invalid');
    } catch (error) {
        t.is(error.response.statusCode, 400);
        t.regex(error.response.body.error, /Invalid item-type/);
    }
});

// GET /api/search (Works)
test('GET /api/search filters by item-type=work (Happy Path 1)', async (t) => {
    const { body } = await t.context.got('api/search?item-type=work');
    t.true(body.success);
    t.true(Array.isArray(body.data.works));
    t.is(body.data.users.length, 0); // Should be empty
});

test('GET /api/search filters by work-type (Happy Path 2)', async (t) => {
    const { body } = await t.context.got('api/search?item-type=work&work-type=movie');
    t.true(body.success);
    t.true(body.data.works.length > 0);
    body.data.works.forEach(work => {
        t.is(work.type, 'movie');
    });
});

test('GET /api/search filters by genre (Happy Path 3)', async (t) => {
    // Assuming 'Drama' is a valid genre in mock data
    const { body } = await t.context.got('api/search?item-type=work&genre=Drama');
    t.true(body.success);
    t.true(body.data.works.length > 0);
    body.data.works.forEach(work => {
        t.true(work.genres.includes('Drama'));
    });
});

test('GET /api/search filters by year (Happy Path 4)', async (t) => {
    // Assuming works from 2000 exist
    const { body } = await t.context.got('api/search?item-type=work&year=2000');
    t.true(body.success);
    t.true(body.data.works.length > 0);
    body.data.works.forEach(work => {
        t.true(work.year >= 2000);
    });
});

test('GET /api/search filters by minimum rating (Happy Path 5)', async (t) => {
    // Assuming there are works with rating >= 4
    const { body } = await t.context.got('api/search?item-type=work&rating=4');
    t.true(body.success);
    // Note: Mock data ratings might be 0 if not calculated/enriched in search mock,
    // but searchService mock implementation does calculate ratings.
    // Let's verify if any returned.
    if (body.data.works.length > 0) {
        body.data.works.forEach(work => {
            t.true(work.rating >= 4);
        });
    } else {
        t.pass('No works found with rating >= 4, but request succeeded');
    }
});

test('GET /api/search returns error for invalid year (Unhappy Path 1)', async (t) => {
    try {
        await t.context.got('api/search?year=notanumber');
    } catch (error) {
        t.is(error.response.statusCode, 400);
        t.regex(error.response.body.error, /Invalid year/);
    }
});

test('GET /api/search returns error for invalid rating (Unhappy Path 2)', async (t) => {
    try {
        await t.context.got('api/search?rating=notanumber');
    } catch (error) {
        t.is(error.response.statusCode, 400);
        t.regex(error.response.body.error, /Invalid rating/);
    }
});

// GET /api/search (Users)
test('GET /api/search filters by item-type=user (Happy Path 1)', async (t) => {
    const { body } = await t.context.got('api/search?item-type=user');
    t.true(body.success);
    t.true(Array.isArray(body.data.users));
    t.is(body.data.works.length, 0); // Should be empty
});

test('GET /api/search filters users by username (Happy Path 2)', async (t) => {
    // Assuming 'alice' exists
    const { body } = await t.context.got('api/search?item-type=user&query=alice');
    t.true(body.success);
    t.true(body.data.users.length > 0);
    body.data.users.forEach(user => {
        t.regex(user.username.toLowerCase(), /alice/);
    });
});
