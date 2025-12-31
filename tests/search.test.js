// Search tests
import test from 'ava';
import { setupTestServer, teardownTestServer } from './helpers/setup.js';

test.before(setupTestServer);
test.after.always(teardownTestServer);

// Basic search
test('GET /api/search returns all without filters', async (t) => {
    const { body } = await t.context.got('api/search');

    t.true(body.success);
    t.truthy(body.data);
    t.true(Array.isArray(body.data.works));
    t.true(Array.isArray(body.data.users));
    t.is(typeof body.data.totalWorks, 'number');
    t.is(typeof body.data.totalUsers, 'number');
});

test('GET /api/search filters by query', async (t) => {
    const { body } = await t.context.got('api/search?query=lord');

    t.true(body.success);
    t.true(Array.isArray(body.data.works));
    if (body.data.works.length > 0) {
        const hasLord = body.data.works.some(work =>
            work.title.toLowerCase().includes('lord') ||
            work.description.toLowerCase().includes('lord')
        );
        t.true(hasLord);
    }
});

test('GET /api/search returns empty when no matches', async (t) => {
    const { body } = await t.context.got('api/search?query=nonexistentwork12345xyz');

    t.true(body.success);
    t.is(body.data.works.length, 0);
    t.is(body.data.totalWorks, 0);
});

test('GET /api/search item-type=work', async (t) => {
    const { body } = await t.context.got('api/search?item-type=work');

    t.true(body.success);
    t.true(body.data.works.length > 0);
    t.is(body.data.users.length, 0);
});

test('GET /api/search item-type=user', async (t) => {
    const { body } = await t.context.got('api/search?item-type=user');

    t.true(body.success);
    t.true(body.data.users.length > 0);
    t.is(body.data.works.length, 0);
});

test('GET /api/search returns 400 for invalid item-type', async (t) => {
    try {
        await t.context.got('api/search?item-type=invalid');
        t.fail('Should have thrown an error');
    } catch (error) {
        t.is(error.response.statusCode, 400);
        t.regex(error.response.body.error, /invalid item-type/i);
    }
});

test('GET /api/search handles case-insensitive item-type', async (t) => {
    const { body } = await t.context.got('api/search?item-type=WORK');

    t.true(body.success);
    t.true(Array.isArray(body.data.works));
    t.is(body.data.users.length, 0);
});

// Filter combinations
test('GET /api/search combines multiple filters', async (t) => {
    const { body } = await t.context.got('api/search?item-type=work&work-type=movie&genre=Action&rating=3.0');

    t.true(body.success);
    t.is(body.data.users.length, 0);
    body.data.works.forEach(work => {
        t.is(work.type, 'movie');
        t.true(work.genres.includes('Action'));
        if (work.rating !== undefined && work.rating !== null) {
            t.true(work.rating >= 3.0);
        }
    });
});

test('GET /api/search combines query and work-type', async (t) => {
    const { body } = await t.context.got('api/search?query=the&work-type=movie');

    t.true(body.success);
    body.data.works.forEach(work => {
        t.is(work.type, 'movie');
        const matchesQuery =
            work.title.toLowerCase().includes('the') ||
            work.description.toLowerCase().includes('the');
        t.true(matchesQuery);
    });
});

test('GET /api/search all filters combined', async (t) => {
    const { body } = await t.context.got('api/search?query=action&item-type=work&work-type=movie&genre=Action&rating=3&year=2000');

    t.true(body.success);
    t.true(Array.isArray(body.data.works));
    t.is(body.data.users.length, 0);
});

test('GET /api/search user by username', async (t) => {
    const { body } = await t.context.got('api/search?item-type=user&query=alice');

    t.true(body.success);
    if (body.data.users.length > 0) {
        const hasAlice = body.data.users.some(user =>
            user.username.toLowerCase().includes('alice')
        );
        t.true(hasAlice);
    }
});

// Response structure
test('GET /api/search work includes rating info', async (t) => {
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

test('GET /api/search user includes properties', async (t) => {
    const { body } = await t.context.got('api/search?item-type=user');

    t.true(body.success);
    if (body.data.users.length > 0) {
        const user = body.data.users[0];
        t.truthy(user.userId);
        t.truthy(user.username);
        t.truthy(user.email);
    }
});

test('GET /api/search metadata counts match', async (t) => {
    const { body } = await t.context.got('api/search');

    t.true(body.success);
    t.is(body.data.totalWorks, body.data.works.length);
    t.is(body.data.totalUsers, body.data.users.length);
});

// Work type filter
test('GET /api/search work-type=movie', async (t) => {
    const { body } = await t.context.got('api/search?work-type=movie');

    t.true(body.success);
    body.data.works.forEach(work => {
        t.is(work.type, 'movie');
    });
});

test('GET /api/search handles case-insensitive work-type', async (t) => {
    const { body } = await t.context.got('api/search?work-type=MOVIE');

    t.true(body.success);
    t.true(Array.isArray(body.data.works));
});

// Genre filter
test('GET /api/search genre=Action', async (t) => {
    const { body } = await t.context.got('api/search?genre=Action');

    t.true(body.success);
    body.data.works.forEach(work => {
        t.true(work.genres.includes('Action'));
    });
});

// Rating filter
test('GET /api/search rating=4.0', async (t) => {
    const { body } = await t.context.got('api/search?rating=4.0');

    t.true(body.success);
    body.data.works.forEach(work => {
        if (work.rating !== undefined && work.rating !== null) {
            t.true(work.rating >= 4.0);
        }
    });
});

test('GET /api/search rating as integer', async (t) => {
    const { body } = await t.context.got('api/search?rating=4');

    t.true(body.success);
    t.true(Array.isArray(body.data.works));
});

test('GET /api/search rating as decimal', async (t) => {
    const { body } = await t.context.got('api/search?rating=4.5');

    t.true(body.success);
    t.true(Array.isArray(body.data.works));
});

test('GET /api/search returns 400 for invalid rating', async (t) => {
    try {
        await t.context.got('api/search?rating=invalid');
        t.fail('Should have thrown an error');
    } catch (error) {
        t.is(error.response.statusCode, 400);
        t.regex(error.response.body.error, /invalid rating/i);
    }
});

// Year filter
test('GET /api/search year=2020', async (t) => {
    const { body } = await t.context.got('api/search?year=2020');

    t.true(body.success);
    body.data.works.forEach(work => {
        t.true(work.year >= 2020);
    });
});

test('GET /api/search returns 400 for invalid year', async (t) => {
    try {
        await t.context.got('api/search?year=notayear');
        t.fail('Should have thrown an error');
    } catch (error) {
        t.is(error.response.statusCode, 400);
        t.regex(error.response.body.error, /invalid year/i);
    }
});
