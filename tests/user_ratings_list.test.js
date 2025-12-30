/**
 * ============================================================
 * USER RATINGS LIST TESTS
 * ============================================================
 * Tests for listing user ratings.
 * 
 * This file covers retrieving ratings for a specific user.
 * 
 * Endpoint covered:
 * - GET /api/users/:userId/ratings - List user's ratings
 * 
 * Test categories:
 * - Happy Path: User with ratings, user without ratings
 * - Unhappy Path: Non-existent user
 * 
 * @module tests/user_ratings_list
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
// GET /api/users/:userId/ratings - LIST USER'S RATINGS
// ============================================================

/**
 * Happy Path: Get ratings for user with ratings.
 * Expected: 200 OK, object containing rated works.
 */
test('GET /api/users/:userId/ratings - returns ratings for user', async (t) => {
    const { body } = await t.context.got('api/users/1/ratings');
    t.true(body.success);
    t.is(typeof body.data, 'object');
});

/**
 * Happy Path: Get ratings for user with no ratings.
 * Expected: 200 OK, empty object.
 */
test('GET /api/users/:userId/ratings - empty for user with no ratings', async (t) => {
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

/**
 * Unhappy Path: Get ratings for non-existent user.
 * Expected: 404 Not Found.
 */
test('GET /api/users/:userId/ratings - 404 for non-existent user', async (t) => {
    try {
        await t.context.got('api/users/999999/ratings');
    } catch (error) {
        t.is(error.response.statusCode, 404);
        t.regex(error.response.body.error, /User not found/);
    }
});
