// User social features tests (following, followers)
import test from 'ava';
import { setupTestServer, teardownTestServer } from './helpers/setup.js';

test.before(setupTestServer);
test.after.always(teardownTestServer);

// GET /api/users/:userId/following
test('GET /api/users/:userId/following returns following list', async (t) => {
    const { body } = await t.context.got('api/users/1/following');
    t.true(body.success);
    t.true(Array.isArray(body.data.following));
    t.true(body.data.following.length > 0);
});

test('GET /api/users/:userId/following returns empty for user with no following', async (t) => {
    const { body } = await t.context.got('api/users/8/following');
    t.true(body.success);
    t.true(Array.isArray(body.data.following));
    t.is(body.data.following.length, 0);
});

test('GET /api/users/:userId/following returns 404 for non-existent user', async (t) => {
    try {
        await t.context.got('api/users/999999/following');
    } catch (error) {
        t.is(error.response.statusCode, 404);
    }
});

// POST /api/users/:userId/following/:followeeId - Follow user
test('POST follow successfully follows a user', async (t) => {
    const { body } = await t.context.got.post('api/users/8/following/10');
    t.true(body.success);
    t.truthy(body.data.userId);
    t.truthy(body.data.username);
});

test('POST follow allows mutual follow', async (t) => {
    const { body } = await t.context.got.post('api/users/10/following/8');
    t.true(body.success);
    t.truthy(body.data.userId);
    t.truthy(body.data.username);
});

test('POST follow returns 400 when following self', async (t) => {
    try {
        await t.context.got.post('api/users/8/following/8');
    } catch (error) {
        t.is(error.response.statusCode, 400);
        t.regex(error.response.body.error, /cannot follow yourself/i);
    }
});

test('POST follow returns 400 when already following', async (t) => {
    try {
        await t.context.got.post('api/users/8/following/10');
    } catch (error) {
        t.is(error.response.statusCode, 400);
        t.regex(error.response.body.error, /already following/i);
    }
});

test('POST follow returns 404 for non-existent user', async (t) => {
    try {
        await t.context.got.post('api/users/999999/following/1');
    } catch (error) {
        t.is(error.response.statusCode, 404);
    }
});

// DELETE /api/users/:userId/following/:followeeId - Unfollow user
test('DELETE unfollow successfully unfollows a user', async (t) => {
    try {
        await t.context.got.post('api/users/8/following/10');
    } catch (e) {
        // Already following, ignore error
    }

    const { body } = await t.context.got.delete('api/users/8/following/10');
    t.true(body.success);
    t.truthy(body.data.userId);
    t.truthy(body.data.username);
});

test('DELETE unfollow removes from both lists', async (t) => {
    const userA = { username: 'userA', email: 'usera@example.com', password: 'password123' };
    const { body: createdA } = await t.context.got.post('api/users', { json: userA });
    const idA = createdA.data.userId;

    const userB = { username: 'userB', email: 'userb@example.com', password: 'password123' };
    const { body: createdB } = await t.context.got.post('api/users', { json: userB });
    const idB = createdB.data.userId;

    await t.context.got.post(`api/users/${idA}/following/${idB}`);
    await t.context.got.delete(`api/users/${idA}/following/${idB}`);

    const { body: followers } = await t.context.got(`api/users/${idB}/followers`);
    const aInFollowers = followers.data.followers.some(f => f.userId === idA);
    t.false(aInFollowers);

    const { body: following } = await t.context.got(`api/users/${idA}/following`);
    const bInFollowing = following.data.following.some(f => f.userId === idB);
    t.false(bInFollowing);
});

test('DELETE unfollow returns 400 when not following', async (t) => {
    const userC = { username: 'userC', email: 'userc@example.com', password: 'password123' };
    const { body: createdC } = await t.context.got.post('api/users', { json: userC });
    const idC = createdC.data.userId;

    const userD = { username: 'userD', email: 'userd@example.com', password: 'password123' };
    const { body: createdD } = await t.context.got.post('api/users', { json: userD });
    const idD = createdD.data.userId;

    try {
        await t.context.got.delete(`api/users/${idC}/following/${idD}`);
        t.fail('Should have thrown an error');
    } catch (error) {
        t.is(error.response.statusCode, 400);
        t.regex(error.response.body.error, /not following/i);
    }
});

test('DELETE unfollow returns 404 for non-existent user', async (t) => {
    try {
        await t.context.got.delete('api/users/999999/following/1');
    } catch (error) {
        t.is(error.response.statusCode, 404);
    }
});

// GET /api/users/:userId/followers
test('GET /api/users/:userId/followers returns followers list', async (t) => {
    const { body } = await t.context.got('api/users/1/followers');
    t.true(body.success);
    t.true(Array.isArray(body.data.followers));
    t.true(body.data.followers.length > 0);
});

test('GET /api/users/:userId/followers returns empty for user with no followers', async (t) => {
    const { body } = await t.context.got('api/users/8/followers');
    t.true(body.success);
    t.true(Array.isArray(body.data.followers));
    t.is(body.data.followers.length, 0);
});

test('GET /api/users/:userId/followers returns 404 for non-existent user', async (t) => {
    try {
        await t.context.got('api/users/999999/followers');
    } catch (error) {
        t.is(error.response.statusCode, 404);
    }
});
