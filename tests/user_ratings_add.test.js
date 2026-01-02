/**
 * ============================================================
 * USER RATINGS SUBMIT HAPPY PATH TESTS
 * ============================================================
 * Tests for submitting user ratings - happy path scenarios.
 * 
 * Endpoint covered:
 * - POST /api/users/:userId/ratings - Add/update rating
 * 
 * @module tests/user_ratings_add
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
// POST /api/users/:userId/ratings - ADD/UPDATE RATING
// ============================================================

/** Happy Path: Add a new rating. */
test('POST /api/users/:userId/ratings - adds new rating', async (t) => {
    const newUser = { username: 'rater1', email: 'rater1@example.com', password: 'password123' };
    const { body: created } = await t.context.got.post('api/users', { json: newUser });
    const userId = created.data.userId;

    const ratingData = { workId: 1, score: 5 };
    const { body } = await t.context.got.post(`api/users/${userId}/ratings`, { json: ratingData });

    t.true(body.success);
    t.is(body.data.workId, ratingData.workId);
    t.is(body.data.score, ratingData.score);
});

/** Happy Path: Update existing rating. */
test('POST /api/users/:userId/ratings - updates existing rating', async (t) => {
    const newUser = { username: 'updater1', email: 'updater1@example.com', password: 'password123' };
    const { body: created } = await t.context.got.post('api/users', { json: newUser });
    const userId = created.data.userId;

    await t.context.got.post(`api/users/${userId}/ratings`, { json: { workId: 1, score: 3 } });
    const { body } = await t.context.got.post(`api/users/${userId}/ratings`, { json: { workId: 1, score: 5 } });

    t.true(body.success);
    t.is(body.data.score, 5);
});

/** Happy Path: Rating includes timestamp. */
test('POST /api/users/:userId/ratings - returns ratedAt timestamp', async (t) => {
    const newUser = { username: 'timestampuser', email: 'timestamp@example.com', password: 'password123' };
    const { body: created } = await t.context.got.post('api/users', { json: newUser });
    const userId = created.data.userId;

    const { body } = await t.context.got.post(`api/users/${userId}/ratings`, { json: { workId: 1, score: 5 } });

    t.true(body.success);
    t.truthy(body.data.ratedAt);
    t.not(new Date(body.data.ratedAt).toString(), 'Invalid Date');
});

/** Happy Path: Rating updates recommendation version. */
test('POST /api/users/:userId/ratings - updates recommendation version', async (t) => {
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
