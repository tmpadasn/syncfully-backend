// User ratings and recommendations tests
import test from 'ava';
import { setupTestServer, teardownTestServer } from './helpers/setup.js';

test.before(setupTestServer);
test.after.always(teardownTestServer);

// POST /api/users/:userId/ratings - Add/update rating
test('POST /api/users/:userId/ratings adds new rating', async (t) => {
    const newUser = { username: 'rater1', email: 'rater1@example.com', password: 'password123' };
    const { body: created } = await t.context.got.post('api/users', { json: newUser });
    const userId = created.data.userId;

    const ratingData = { workId: 1, score: 5 };
    const { body } = await t.context.got.post(`api/users/${userId}/ratings`, { json: ratingData });

    t.true(body.success);
    t.is(body.data.workId, ratingData.workId);
    t.is(body.data.score, ratingData.score);
});

test('POST /api/users/:userId/ratings updates existing rating', async (t) => {
    const newUser = { username: 'updater1', email: 'updater1@example.com', password: 'password123' };
    const { body: created } = await t.context.got.post('api/users', { json: newUser });
    const userId = created.data.userId;

    await t.context.got.post(`api/users/${userId}/ratings`, { json: { workId: 1, score: 3 } });
    const { body } = await t.context.got.post(`api/users/${userId}/ratings`, { json: { workId: 1, score: 5 } });

    t.true(body.success);
    t.is(body.data.score, 5);
});

test('POST /api/users/:userId/ratings returns ratedAt timestamp', async (t) => {
    const newUser = { username: 'timestampuser', email: 'timestamp@example.com', password: 'password123' };
    const { body: created } = await t.context.got.post('api/users', { json: newUser });
    const userId = created.data.userId;

    const { body } = await t.context.got.post(`api/users/${userId}/ratings`, { json: { workId: 1, score: 5 } });

    t.true(body.success);
    t.truthy(body.data.ratedAt);
    t.not(new Date(body.data.ratedAt).toString(), 'Invalid Date');
});

test('POST /api/users/:userId/ratings updates recommendation version', async (t) => {
    const newUser = { username: 'versionuser', email: 'version@example.com', password: 'password123' };
    const { body: created } = await t.context.got.post('api/users', { json: newUser });
    const userId = created.data.userId;

    const { body: initial } = await t.context.got(`api/users/${userId}/recommendations`);
    const initialVersion = initial.data.version;

    await t.context.got.post(`api/users/${userId}/ratings`, { json: { workId: 1, score: 5 } });

    const { body: updated } = await t.context.got(`api/users/${userId}/recommendations`);
    const updatedVersion = updated.data.version;

    t.not(initialVersion, updatedVersion);
    t.true(updatedVersion > initialVersion);
});

test('POST /api/users/:userId/ratings returns 400 for invalid score', async (t) => {
    try {
        await t.context.got.post('api/users/1/ratings', { json: { workId: 1, score: 6 } });
    } catch (error) {
        t.is(error.response.statusCode, 400);
        t.true(error.response.body.error.includes('score must be between 1 and 5'));
    }
});

test('POST /api/users/:userId/ratings returns 400 for missing workId', async (t) => {
    try {
        await t.context.got.post('api/users/1/ratings', { json: { score: 5 } });
    } catch (error) {
        t.is(error.response.statusCode, 400);
        t.true(error.response.body.error.includes('workId is required'));
    }
});

test('POST /api/users/:userId/ratings returns 404 for non-existent user', async (t) => {
    try {
        await t.context.got.post('api/users/999999/ratings', { json: { workId: 1, score: 5 } });
    } catch (error) {
        t.is(error.response.statusCode, 404);
        t.regex(error.response.body.error, /User not found/);
    }
});

// GET /api/users/:userId/ratings - List user's ratings
test('GET /api/users/:userId/ratings returns ratings for user', async (t) => {
    const { body } = await t.context.got('api/users/1/ratings');
    t.true(body.success);
    t.is(typeof body.data, 'object');
});

test('GET /api/users/:userId/ratings returns empty for user with no ratings', async (t) => {
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

test('GET /api/users/:userId/ratings returns 404 for non-existent user', async (t) => {
    try {
        await t.context.got('api/users/999999/ratings');
    } catch (error) {
        t.is(error.response.statusCode, 404);
        t.regex(error.response.body.error, /User not found/);
    }
});

// GET /api/users/:userId/recommendations - Get recommendations
test('GET /api/users/:userId/recommendations returns recommendations', async (t) => {
    const { body } = await t.context.got('api/users/1/recommendations');
    t.true(body.success);
    t.truthy(body.data.current);
    t.truthy(body.data.profile);
    t.truthy(body.data.version);
});

test('GET /api/users/:userId/recommendations verifies structure', async (t) => {
    const { body } = await t.context.got('api/users/1/recommendations');
    t.true(Array.isArray(body.data.current));
    t.true(Array.isArray(body.data.profile));
    t.is(typeof body.data.version, 'number');

    if (body.data.current.length > 0) {
        t.truthy(body.data.current[0].title);
    }
});

test('GET /api/users/:userId/recommendations returns correct count', async (t) => {
    const { body } = await t.context.got('api/users/1/recommendations');
    t.true(body.success);
    t.is(body.data.current.length, 5);
    t.is(body.data.profile.length, 5);
});

test('GET /api/users/:userId/recommendations handles cold start', async (t) => {
    const newUser = {
        username: 'coldstart',
        email: 'coldstart@example.com',
        password: 'password123'
    };
    const { body: created } = await t.context.got.post('api/users', { json: newUser });
    const userId = created.data.userId;

    const { body } = await t.context.got(`api/users/${userId}/recommendations`);
    t.true(body.success);
    t.is(body.data.current.length, 5);
    t.is(body.data.profile.length, 5);
});

test('GET /api/users/:userId/recommendations returns 404 for non-existent user', async (t) => {
    try {
        await t.context.got('api/users/999999/recommendations');
    } catch (error) {
        t.is(error.response.statusCode, 404);
        t.regex(error.response.body.error, /User not found/);
    }
});
