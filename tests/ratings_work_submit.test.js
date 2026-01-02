/**
 * ============================================================
 * WORK RATINGS SUBMIT TESTS
 * ============================================================
 * Tests for submitting ratings for a work.
 * 
 * Endpoint covered:
 * - POST /api/works/:workId/ratings - Submit or update a rating
 * 
 * @module tests/ratings_work_submit
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
// POST /api/works/:workId/ratings - SUBMIT RATING
// ============================================================

/** Happy Path: Submit a rating for a work. */
test('POST /api/works/:workId/ratings - submits rating', async (t) => {
    const ratingData = { userId: 1, score: 5 };
    const { body } = await t.context.got.post('api/works/1/ratings', { json: ratingData });
    t.true(body.success);
    t.is(body.data.score, ratingData.score);
    t.is(body.data.userId, ratingData.userId);
});

/** Happy Path: Update existing rating. */
test('POST /api/works/:workId/ratings - updates existing rating', async (t) => {
    const ratingData = { userId: 1, score: 3 };
    const { body } = await t.context.got.post('api/works/1/ratings', { json: ratingData });
    t.true(body.success);
    t.is(body.data.score, ratingData.score);

    const { body: ratings } = await t.context.got('api/works/1/ratings');
    const userRating = ratings.data.ratings.find(r => r.userId === 1);
    t.is(userRating.score, 3);
});

/** Unhappy Path: Invalid score (> 5). */
test('POST /api/works/:workId/ratings - 400 for invalid score', async (t) => {
    try {
        await t.context.got.post('api/works/1/ratings', { json: { userId: 1, score: 6 } });
    } catch (error) {
        t.is(error.response.statusCode, 400);
    }
});

/** Unhappy Path: Non-existent work. */
test('POST /api/works/:workId/ratings - 404 for non-existent work', async (t) => {
    try {
        await t.context.got.post('api/works/999999/ratings', { json: { userId: 1, score: 5 } });
    } catch (error) {
        t.is(error.response.statusCode, 404);
    }
});
