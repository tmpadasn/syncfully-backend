/**
 * ============================================================
 * SEARCH FILTERS TESTS
 * ============================================================
 * Tests for individual search filters.
 * 
 * This file covers individual filter tests including work-type,
 * genre, rating, and year filters.
 * 
 * Endpoint covered:
 * - GET /api/search
 * 
 * Test categories:
 * - Happy Path: Filter functionality
 * - Unhappy Path: Invalid filter values
 * - Edge Case: Different value formats
 * 
 * @module tests/search_filters
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
// WORK-TYPE FILTER
// ============================================================

/**
 * Happy Path: Filter by work-type.
 * Expected: All returned works are of that type.
 */
test('GET /api/search - work-type=movie', async (t) => {
    const { body } = await t.context.got('api/search?work-type=movie');

    t.true(body.success);
    body.data.works.forEach(work => {
        t.is(work.type, 'movie');
    });
});

/**
 * Edge Case: Case-insensitive work-type.
 */
test('GET /api/search - case-insensitive work-type', async (t) => {
    const { body } = await t.context.got('api/search?work-type=MOVIE');

    t.true(body.success);
    t.true(Array.isArray(body.data.works));
});

// ============================================================
// GENRE FILTER
// ============================================================

/**
 * Happy Path: Filter by genre.
 * Expected: All returned works have that genre.
 */
test('GET /api/search - genre=Action', async (t) => {
    const { body } = await t.context.got('api/search?genre=Action');

    t.true(body.success);
    body.data.works.forEach(work => {
        t.true(work.genres.includes('Action'));
    });
});

// ============================================================
// RATING FILTER
// ============================================================

/**
 * Happy Path: Filter by minimum rating.
 * Expected: All returned works have rating >= threshold.
 */
test('GET /api/search - rating=4.0', async (t) => {
    const { body } = await t.context.got('api/search?rating=4.0');

    t.true(body.success);
    body.data.works.forEach(work => {
        if (work.rating !== undefined && work.rating !== null) {
            t.true(work.rating >= 4.0);
        }
    });
});

/**
 * Edge Case: Rating as integer.
 */
test('GET /api/search - rating as integer', async (t) => {
    const { body } = await t.context.got('api/search?rating=4');

    t.true(body.success);
    t.true(Array.isArray(body.data.works));
});

/**
 * Edge Case: Rating as decimal.
 */
test('GET /api/search - rating as decimal', async (t) => {
    const { body } = await t.context.got('api/search?rating=4.5');

    t.true(body.success);
    t.true(Array.isArray(body.data.works));
});

/**
 * Unhappy Path: Invalid rating format.
 * Expected: 400 Bad Request.
 */
test('GET /api/search - 400 for invalid rating', async (t) => {
    try {
        await t.context.got('api/search?rating=invalid');
        t.fail('Should have thrown an error');
    } catch (error) {
        t.is(error.response.statusCode, 400);
        t.regex(error.response.body.error, /invalid rating/i);
    }
});

// ============================================================
// YEAR FILTER
// ============================================================

/**
 * Happy Path: Filter by year.
 * Expected: All returned works are from that year or later.
 */
test('GET /api/search - year=2020', async (t) => {
    const { body } = await t.context.got('api/search?year=2020');

    t.true(body.success);
    body.data.works.forEach(work => {
        t.true(work.year >= 2020);
    });
});

/**
 * Unhappy Path: Invalid year format.
 * Expected: 400 Bad Request.
 */
test('GET /api/search - 400 for invalid year', async (t) => {
    try {
        await t.context.got('api/search?year=notayear');
        t.fail('Should have thrown an error');
    } catch (error) {
        t.is(error.response.statusCode, 400);
        t.regex(error.response.body.error, /invalid year/i);
    }
});
