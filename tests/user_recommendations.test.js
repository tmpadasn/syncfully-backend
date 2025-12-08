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

// GET /api/users/:userId/recommendations
test('GET /api/users/:userId/recommendations returns recommendations for existing user (Happy Path 1)', async (t) => {
    const { body } = await t.context.got('api/users/1/recommendations');
    t.true(body.success);
    t.truthy(body.data.current);
    t.truthy(body.data.profile);
    t.truthy(body.data.version);
});

test('GET /api/users/:userId/recommendations verifies structure (Happy Path 2)', async (t) => {
    const { body } = await t.context.got('api/users/1/recommendations');
    t.true(Array.isArray(body.data.current));
    t.true(Array.isArray(body.data.profile));
    t.is(typeof body.data.version, 'number');

    // Verify items in arrays are works
    if (body.data.current.length > 0) {
        t.truthy(body.data.current[0].title);
    }
});

test('GET /api/users/:userId/recommendations returns 404 for non-existent user (Unhappy Path 1)', async (t) => {
    try {
        await t.context.got('api/users/999999/recommendations');
    } catch (error) {
        t.is(error.response.statusCode, 404);
        t.regex(error.response.body.error, /User not found/);
    }
});

test('GET /api/users/:userId/recommendations returns correct number of items (Happy Path 3)', async (t) => {
    // Assuming mock data has enough works (at least 10)
    const { body } = await t.context.got('api/users/1/recommendations');
    t.true(body.success);
    t.is(body.data.current.length, 5);
    t.is(body.data.profile.length, 5);
});

test('GET /api/users/:userId/recommendations works for cold start (Happy Path 4)', async (t) => {
    // Create new user with no ratings
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

