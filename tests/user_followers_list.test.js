/**
 * ============================================================
 * USER FOLLOWERS LIST TESTS
 * ============================================================
 * Tests for listing user followers.
 * 
 * Endpoint covered:
 * - GET /api/users/:userId/followers - List followers
 * 
 * @module tests/user_followers_list
 */

import test from 'ava';
import got from 'got';
import listen from 'test-listen';
import http from 'http';
import app from '../app.js';

// ============================================================
// TEST SETUP & TEARDOWN
// ============================================================

test.before(async (t) => {
    t.context.server = http.createServer(app);
    t.context.prefixUrl = await listen(t.context.server);
    t.context.got = got.extend({ prefixUrl: t.context.prefixUrl, responseType: 'json' });
});

test.after.always((t) => {
    t.context.server.close();
});

// ============================================================
// GET /api/users/:userId/followers - LIST FOLLOWERS
// ============================================================

/**
 * Happy Path: Get followers list for user with followers.
 * Expected: 200 OK, array of users.
 */
test('GET /api/users/:userId/followers - returns followers list', async (t) => {
    const { body } = await t.context.got('api/users/1/followers');
    t.true(body.success);
    t.true(Array.isArray(body.data.followers));
    t.true(body.data.followers.length > 0); // Alice has followers
});

/**
 * Happy Path: Get followers list for user with no followers.
 * Expected: 200 OK, empty array.
 */
test('GET /api/users/:userId/followers - empty for user with no followers', async (t) => {
    const { body } = await t.context.got('api/users/8/followers'); // Henry has no followers
    t.true(body.success);
    t.true(Array.isArray(body.data.followers));
    t.is(body.data.followers.length, 0);
});

/**
 * Unhappy Path: Get followers for non-existent user.
 * Expected: 404 Not Found.
 */
test('GET /api/users/:userId/followers - 404 for non-existent user', async (t) => {
    try {
        await t.context.got('api/users/999999/followers');
    } catch (error) {
        t.is(error.response.statusCode, 404);
    }
});
