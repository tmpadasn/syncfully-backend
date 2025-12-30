/**
 * ============================================================
 * SEARCH BASIC TESTS
 * ============================================================
 * Tests for basic search functionality and item-type filtering.
 * 
 * This file covers basic search operations including unfiltered search,
 * query-based search, and item-type filtering.
 * 
 * Endpoint covered:
 * - GET /api/search
 * 
 * Test categories:
 * - Happy Path: Basic search and item-type filtering
 * - Unhappy Path: Invalid item-type
 * - Edge Case: Case-insensitive handling
 * 
 * @module tests/search_basic
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
// BASIC SEARCH (NO FILTERS)
// ============================================================

/**
 * Happy Path: Search without filters returns all.
 * Expected: 200 OK, arrays of works and users with counts.
 */
test('GET /api/search - returns all without filters', async (t) => {
    const { body } = await t.context.got('api/search');

    t.true(body.success);
    t.truthy(body.data);
    t.true(Array.isArray(body.data.works));
    t.true(Array.isArray(body.data.users));
    t.is(typeof body.data.totalWorks, 'number');
    t.is(typeof body.data.totalUsers, 'number');
});

/**
 * Happy Path: Search by query string.
 * Expected: Results match query.
 */
test('GET /api/search - filters by query', async (t) => {
    const { body } = await t.context.got('api/search?query=lord');

    t.true(body.success);
    t.true(Array.isArray(body.data.works));
    if (body.data.works.length > 0) {
        const hasLord = body.data.works.some(work =>
            work.title.toLowerCase().includes('lord') ||
            work.description.toLowerCase().includes('lord')
        );
        t.true(hasLord);
    }
});

/**
 * Happy Path: Empty results when no matches.
 * Expected: 200 OK, empty arrays.
 */
test('GET /api/search - empty when no matches', async (t) => {
    const { body } = await t.context.got('api/search?query=nonexistentwork12345xyz');

    t.true(body.success);
    t.is(body.data.works.length, 0);
    t.is(body.data.totalWorks, 0);
});

// ============================================================
// ITEM-TYPE FILTER
// ============================================================

/**
 * Happy Path: Filter by item-type=work.
 * Expected: Only works returned, no users.
 */
test('GET /api/search - item-type=work', async (t) => {
    const { body } = await t.context.got('api/search?item-type=work');

    t.true(body.success);
    t.true(body.data.works.length > 0);
    t.is(body.data.users.length, 0);
});

/**
 * Happy Path: Filter by item-type=user.
 * Expected: Only users returned, no works.
 */
test('GET /api/search - item-type=user', async (t) => {
    const { body } = await t.context.got('api/search?item-type=user');

    t.true(body.success);
    t.true(body.data.users.length > 0);
    t.is(body.data.works.length, 0);
});

/**
 * Unhappy Path: Invalid item-type.
 * Expected: 400 Bad Request.
 */
test('GET /api/search - 400 for invalid item-type', async (t) => {
    try {
        await t.context.got('api/search?item-type=invalid');
        t.fail('Should have thrown an error');
    } catch (error) {
        t.is(error.response.statusCode, 400);
        t.regex(error.response.body.error, /invalid item-type/i);
    }
});

/**
 * Edge Case: Case-insensitive item-type.
 * Expected: WORK and work treated the same.
 */
test('GET /api/search - case-insensitive item-type', async (t) => {
    const { body } = await t.context.got('api/search?item-type=WORK');

    t.true(body.success);
    t.true(Array.isArray(body.data.works));
    t.is(body.data.users.length, 0);
});
