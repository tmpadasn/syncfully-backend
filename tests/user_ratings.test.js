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

// GET /api/users/:userId/ratings
test('GET /api/users/:userId/ratings returns ratings for existing user (Happy Path 1)', async (t) => {
    // Assuming mock data has a user with ID 1
    const { body } = await t.context.got('api/users/1/ratings');
    t.true(body.success);
    t.is(typeof body.data, 'object');
});

test('GET /api/users/:userId/ratings returns empty object for user with no ratings (Happy Path 2)', async (t) => {
    // Create a new user to ensure no ratings
    const newUser = {
        username: 'noratingsuser',
        email: 'noratings@example.com',
        password: 'password123'
    };
    const { body: created } = await t.context.got.post('api/users', { json: newUser });
    const userId = created.data.userId;

    const { body } = await t.context.got(`api/users/${userId}/ratings`);
    t.true(body.success);
    t.deepEqual(body.data, {});
});

test('GET /api/users/:userId/ratings returns 404 for non-existent user (Unhappy Path 1)', async (t) => {
    try {
        await t.context.got('api/users/999999/ratings');
    } catch (error) {
        t.is(error.response.statusCode, 404);
        t.regex(error.response.body.error, /User not found/);
    }
});

// POST /api/users/:userId/ratings
test('POST /api/users/:userId/ratings adds a new rating (Happy Path 1)', async (t) => {
    // Create user
    const newUser = {
        username: 'rater1',
        email: 'rater1@example.com',
        password: 'password123'
    };
    const { body: created } = await t.context.got.post('api/users', { json: newUser });
    const userId = created.data.userId;

    // Rate work 1
    const ratingData = { workId: 1, score: 5 };
    const { body } = await t.context.got.post(`api/users/${userId}/ratings`, {
        json: ratingData
    });

    t.true(body.success);
    t.is(body.data.workId, ratingData.workId);
    t.is(body.data.score, ratingData.score);
});

test('POST /api/users/:userId/ratings updates existing rating (Happy Path 2)', async (t) => {
    // Create user
    const newUser = {
        username: 'updater1',
        email: 'updater1@example.com',
        password: 'password123'
    };
    const { body: created } = await t.context.got.post('api/users', { json: newUser });
    const userId = created.data.userId;

    // Rate work 1
    await t.context.got.post(`api/users/${userId}/ratings`, {
        json: { workId: 1, score: 3 }
    });

    // Update rating for work 1
    const { body } = await t.context.got.post(`api/users/${userId}/ratings`, {
        json: { workId: 1, score: 5 }
    });

    t.true(body.success);
    t.is(body.data.score, 5);
});

test('POST /api/users/:userId/ratings returns error for invalid score (Unhappy Path 1)', async (t) => {
    try {
        await t.context.got.post('api/users/1/ratings', {
            json: { workId: 1, score: 6 }
        });
    } catch (error) {
        t.is(error.response.statusCode, 400);
        // Error is an array, check if it contains the message
        t.true(error.response.body.error.includes('score must be between 1 and 5'));
    }
});

test('POST /api/users/:userId/ratings returns error for missing workId (Unhappy Path 2)', async (t) => {
    try {
        await t.context.got.post('api/users/1/ratings', {
            json: { score: 5 }
        });
    } catch (error) {
        t.is(error.response.statusCode, 400);
        t.true(error.response.body.error.includes('workId is required'));
    }
});

test('POST /api/users/:userId/ratings returns 404 for non-existent user (Unhappy Path 3)', async (t) => {
    try {
        await t.context.got.post('api/users/999999/ratings', {
            json: { workId: 1, score: 5 }
        });
    } catch (error) {
        t.is(error.response.statusCode, 404);
        t.regex(error.response.body.error, /User not found/);
    }
});

test('POST /api/users/:userId/ratings returns ratedAt timestamp (Happy Path 3)', async (t) => {
    // Create user
    const newUser = {
        username: 'timestampuser',
        email: 'timestamp@example.com',
        password: 'password123'
    };
    const { body: created } = await t.context.got.post('api/users', { json: newUser });
    const userId = created.data.userId;

    const { body } = await t.context.got.post(`api/users/${userId}/ratings`, {
        json: { workId: 1, score: 5 }
    });

    t.true(body.success);
    t.truthy(body.data.ratedAt);
    // Verify it's a valid date string
    t.not(new Date(body.data.ratedAt).toString(), 'Invalid Date');
});

test('POST /api/users/:userId/ratings updates recommendation version (Happy Path 4)', async (t) => {
    // Create user
    const newUser = {
        username: 'versionuser',
        email: 'version@example.com',
        password: 'password123'
    };
    const { body: created } = await t.context.got.post('api/users', { json: newUser });
    const userId = created.data.userId;

    // Get initial version
    const { body: initial } = await t.context.got(`api/users/${userId}/recommendations`);
    const initialVersion = initial.data.version;

    // Add rating
    await t.context.got.post(`api/users/${userId}/ratings`, {
        json: { workId: 1, score: 5 }
    });

    // Get new version
    const { body: updated } = await t.context.got(`api/users/${userId}/recommendations`);
    const updatedVersion = updated.data.version;

    t.not(initialVersion, updatedVersion);
    t.true(updatedVersion > initialVersion);
});

