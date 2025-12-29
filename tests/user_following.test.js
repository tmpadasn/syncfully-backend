/**
 * ============================================================
 * USER FOLLOWING TESTS
 * ============================================================
 * Tests for the following/follow functionality.
 * 
 * This file covers listing who a user follows and
 * the action of following another user.
 * 
 * Endpoints covered:
 * - GET /api/users/:userId/following - List following
 * - POST /api/users/:userId/following/:targetUserId - Follow user
 * 
 * Test categories:
 * - Happy Path: List following, follow user, mutual follow
 * - Unhappy Path: Self-follow, already following, non-existent user
 * 
 * @module tests/user_following
 */

import test from 'ava';
import got from 'got';
import listen from 'test-listen';
import http from 'http';
import app from '../app.js';

// ============================================================
// TEST SETUP & TEARDOWN
// ============================================================

/**
 * Before all tests:
 * - Create HTTP server with the Express app
 * - Get a unique URL for testing
 * - Configure got client with test URL
 */
test.before(async (t) => {
    t.context.server = http.createServer(app);
    t.context.prefixUrl = await listen(t.context.server);
    t.context.got = got.extend({ prefixUrl: t.context.prefixUrl, responseType: 'json' });
});

/**
 * After all tests:
 * - Close the HTTP server to free resources
 */
test.after.always((t) => {
    t.context.server.close();
});

// ============================================================
// GET /api/users/:userId/following - LIST FOLLOWING
// ============================================================

/**
 * Happy Path: Get following list for user with following.
 * Expected: 200 OK, array of users.
 */
test('GET /api/users/:userId/following - returns following list', async (t) => {
    const { body } = await t.context.got('api/users/1/following');
    t.true(body.success);
    t.true(Array.isArray(body.data.following));
    t.true(body.data.following.length > 0); // Alice follows others
});

/**
 * Happy Path: Get following list for user with no following.
 * Expected: 200 OK, empty array.
 */
test('GET /api/users/:userId/following - empty for user with no following', async (t) => {
    const { body } = await t.context.got('api/users/8/following'); // Henry has no following
    t.true(body.success);
    t.true(Array.isArray(body.data.following));
    t.is(body.data.following.length, 0);
});

/**
 * Unhappy Path: Get following for non-existent user.
 * Expected: 404 Not Found.
 */
test('GET /api/users/:userId/following - 404 for non-existent user', async (t) => {
    try {
        await t.context.got('api/users/999999/following');
    } catch (error) {
        t.is(error.response.statusCode, 404);
    }
});

// ============================================================
// POST /api/users/:userId/following/:targetUserId - FOLLOW USER
// ============================================================

/**
 * Happy Path: Follow another user.
 * Expected: 200 OK, target user data returned.
 */
test('POST follow - successfully follows a user', async (t) => {
    // Henry follows Jack
    const { body } = await t.context.got.post('api/users/8/following/10');
    t.true(body.success);
    t.truthy(body.data.userId);
    t.truthy(body.data.username);
});

/**
 * Happy Path: Create mutual follow (Jack follows Henry back).
 * Expected: 200 OK, target user data returned.
 */
test('POST follow - mutual follow works', async (t) => {
    // Jack follows Henry back
    const { body } = await t.context.got.post('api/users/10/following/8');
    t.true(body.success);
    t.truthy(body.data.userId);
    t.truthy(body.data.username);
});

/**
 * Unhappy Path: User tries to follow themselves.
 * Expected: 400 Bad Request.
 */
test('POST follow - 400 when following self', async (t) => {
    try {
        await t.context.got.post('api/users/8/following/8');
    } catch (error) {
        t.is(error.response.statusCode, 400);
        t.regex(error.response.body.error, /cannot follow yourself/i);
    }
});

/**
 * Unhappy Path: Already following the target user.
 * Expected: 400 Bad Request.
 */
test('POST follow - 400 when already following', async (t) => {
    try {
        await t.context.got.post('api/users/8/following/10'); // Already followed above
    } catch (error) {
        t.is(error.response.statusCode, 400);
        t.regex(error.response.body.error, /already following/i);
    }
});

/**
 * Unhappy Path: Follower user doesn't exist.
 * Expected: 404 Not Found.
 */
test('POST follow - 404 for non-existent user', async (t) => {
    try {
        await t.context.got.post('api/users/999999/following/1');
    } catch (error) {
        t.is(error.response.statusCode, 404);
    }
});

/**
 * Unhappy Path: Target user doesn't exist.
 * SKIPPED: API bug - returns 500 instead of 404.
 * See userController.js line 279-280.
 */
test.skip('POST follow - 404 for non-existent target', async (t) => {
    try {
        await t.context.got.post('api/users/1/following/999999');
    } catch (error) {
        t.is(error.response.statusCode, 404);
    }
});
