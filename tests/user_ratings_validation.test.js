/**
 * ============================================================
 * USER RATINGS VALIDATION TESTS
 * ============================================================
 * Tests for user rating validation errors.
 * 
 * Endpoint covered:
 * - POST /api/users/:userId/ratings - Add/update rating (error cases)
 * 
 * @module tests/user_ratings_validation
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
// VALIDATION ERRORS
// ============================================================

/** Unhappy Path: Invalid score (> 5). */
test('POST /api/users/:userId/ratings - 400 for invalid score', async (t) => {
    try {
        await t.context.got.post('api/users/1/ratings', { json: { workId: 1, score: 6 } });
    } catch (error) {
        t.is(error.response.statusCode, 400);
        t.true(error.response.body.error.includes('score must be between 1 and 5'));
    }
});

/** Unhappy Path: Missing workId. */
test('POST /api/users/:userId/ratings - 400 for missing workId', async (t) => {
    try {
        await t.context.got.post('api/users/1/ratings', { json: { score: 5 } });
    } catch (error) {
        t.is(error.response.statusCode, 400);
        t.true(error.response.body.error.includes('workId is required'));
    }
});

/** Unhappy Path: Non-existent user. */
test('POST /api/users/:userId/ratings - 404 for non-existent user', async (t) => {
    try {
        await t.context.got.post('api/users/999999/ratings', { json: { workId: 1, score: 5 } });
    } catch (error) {
        t.is(error.response.statusCode, 404);
        t.regex(error.response.body.error, /User not found/);
    }
});
