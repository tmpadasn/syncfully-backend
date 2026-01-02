/**
 * ============================================================
 * USER RECOMMENDATIONS TESTS
 * ============================================================
 * Tests for user recommendation operations.
 * 
 * This file covers fetching personalized recommendations
 * for both existing users and cold-start scenarios.
 * 
 * Endpoints covered:
 * - GET /api/users/:userId/recommendations - Get recommendations
 * 
 * Test categories:
 * - Happy Path: Existing user, cold start user
 * - Unhappy Path: Non-existent user
 * 
 * @module tests/user_recommendations
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
// GET /api/users/:userId/recommendations - GET RECOMMENDATIONS
// ============================================================

/**
 * Happy Path: Get recommendations for existing user.
 * Expected: 200 OK, current and profile arrays, version number.
 */
test('GET /api/users/:userId/recommendations - returns recommendations', async (t) => {
    const { body } = await t.context.got('api/users/1/recommendations');
    t.true(body.success);
    t.truthy(body.data.current);
    t.truthy(body.data.profile);
    t.truthy(body.data.version);
});

/**
 * Happy Path: Verify response structure.
 * Expected: current and profile are arrays, version is number.
 */
test('GET /api/users/:userId/recommendations - verifies structure', async (t) => {
    const { body } = await t.context.got('api/users/1/recommendations');
    t.true(Array.isArray(body.data.current));
    t.true(Array.isArray(body.data.profile));
    t.is(typeof body.data.version, 'number');

    // Verify items in arrays are works
    if (body.data.current.length > 0) {
        t.truthy(body.data.current[0].title);
    }
});

/**
 * Happy Path: Recommendations are limited (default 5 each).
 * Expected: current.length <= 5, profile.length <= 5.
 */
test('GET /api/users/:userId/recommendations - returns correct count', async (t) => {
    const { body } = await t.context.got('api/users/1/recommendations');
    t.true(body.success);
    t.is(body.data.current.length, 5);
    t.is(body.data.profile.length, 5);
});

/**
 * Happy Path: Cold start (new user with no ratings).
 * Expected: 200 OK, still returns recommendations.
 */
test('GET /api/users/:userId/recommendations - cold start works', async (t) => {
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

/**
 * Unhappy Path: Non-existent user.
 * Expected: 404 Not Found.
 */
test('GET /api/users/:userId/recommendations - 404 for non-existent user', async (t) => {
    try {
        await t.context.got('api/users/999999/recommendations');
    } catch (error) {
        t.is(error.response.statusCode, 404);
        t.regex(error.response.body.error, /User not found/);
    }
});
