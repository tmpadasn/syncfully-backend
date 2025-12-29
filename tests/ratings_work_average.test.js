/**
 * ============================================================
 * WORK RATINGS AVERAGE TESTS
 * ============================================================
 * Tests for getting average rating for a work.
 * 
 * Endpoint covered:
 * - GET /api/works/:workId/ratings/average - Get average rating
 * 
 * @module tests/ratings_work_average
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
// GET /api/works/:workId/ratings/average - GET AVERAGE RATING
// ============================================================

/** Happy Path: Get average rating. */
test('GET /api/works/:workId/ratings/average - returns average', async (t) => {
    const { body } = await t.context.got('api/works/1/ratings/average');
    t.true(body.success);
    t.truthy(body.data.averageRating !== undefined);
    t.truthy(body.data.totalRatings !== undefined);
});

/** Happy Path: Average is 0 for work with no ratings. */
test('GET /api/works/:workId/ratings/average - 0 for no ratings', async (t) => {
    const newWork = { title: 'No Ratings Avg', type: 'movie' };
    const { body: created } = await t.context.got.post('api/works', { json: newWork });
    const workId = created.data.workId;

    const { body } = await t.context.got(`api/works/${workId}/ratings/average`);
    t.true(body.success);
    t.is(body.data.averageRating, 0);
    t.is(body.data.totalRatings, 0);
});

/** Unhappy Path: Invalid work ID format. */
test('GET /api/works/:workId/ratings/average - 400 for invalid ID', async (t) => {
    try {
        await t.context.got('api/works/invalid/ratings/average');
    } catch (error) {
        t.is(error.response.statusCode, 400);
    }
});
