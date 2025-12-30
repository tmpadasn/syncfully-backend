/**
 * ============================================================
 * WORK RATINGS LIST TESTS
 * ============================================================
 * Tests for listing ratings for a work.
 * 
 * Endpoint covered:
 * - GET /api/works/:workId/ratings - List all ratings for a work
 * 
 * @module tests/ratings_work_list
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
// GET /api/works/:workId/ratings - LIST WORK'S RATINGS
// ============================================================

/** Happy Path: Get ratings for a work. */
test('GET /api/works/:workId/ratings - returns ratings', async (t) => {
    const { body } = await t.context.got('api/works/1/ratings');
    t.true(Array.isArray(body.data.ratings));
    t.true(body.success);
});

/** Happy Path: Get ratings for work with no ratings. */
test('GET /api/works/:workId/ratings - empty for work with no ratings', async (t) => {
    const newWork = { title: 'No Ratings', type: 'book' };
    const { body: created } = await t.context.got.post('api/works', { json: newWork });
    const workId = created.data.workId;

    const { body } = await t.context.got(`api/works/${workId}/ratings`);
    t.true(Array.isArray(body.data.ratings));
    t.is(body.data.ratings.length, 0);
    t.true(body.success);
});

/** Unhappy Path: Invalid work ID format. */
test('GET /api/works/:workId/ratings - 400 for invalid ID', async (t) => {
    try {
        await t.context.got('api/works/invalid/ratings');
    } catch (error) {
        t.is(error.response.statusCode, 400);
    }
});
