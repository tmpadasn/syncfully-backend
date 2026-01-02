/**
 * ============================================================
 * SEARCH COMBINED TESTS
 * ============================================================
 * Tests for combined search filters and response structure.
 * 
 * This file covers combined filter scenarios, user search,
 * and response structure validation.
 * 
 * Endpoint covered:
 * - GET /api/search
 * 
 * Test categories:
 * - Happy Path: Combined filters, user search, response structure
 * 
 * @module tests/search_combined
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
// COMBINED FILTERS
// ============================================================

/**
 * Happy Path: Multiple filters combined.
 * Expected: Results satisfy all filters.
 */
test('GET /api/search - multiple filters', async (t) => {
    const { body } = await t.context.got('api/search?item-type=work&work-type=movie&genre=Action&rating=3.0');

    t.true(body.success);
    t.is(body.data.users.length, 0);
    body.data.works.forEach(work => {
        t.is(work.type, 'movie');
        t.true(work.genres.includes('Action'));
        if (work.rating !== undefined && work.rating !== null) {
            t.true(work.rating >= 3.0);
        }
    });
});

/**
 * Happy Path: Query with work-type.
 */
test('GET /api/search - query and work-type', async (t) => {
    const { body } = await t.context.got('api/search?query=the&work-type=movie');

    t.true(body.success);
    body.data.works.forEach(work => {
        t.is(work.type, 'movie');
        const matchesQuery =
            work.title.toLowerCase().includes('the') ||
            work.description.toLowerCase().includes('the');
        t.true(matchesQuery);
    });
});

/**
 * Happy Path: All filters combined.
 */
test('GET /api/search - all filters combined', async (t) => {
    const { body } = await t.context.got('api/search?query=action&item-type=work&work-type=movie&genre=Action&rating=3&year=2000');

    t.true(body.success);
    t.true(Array.isArray(body.data.works));
    t.is(body.data.users.length, 0);
});

// ============================================================
// USER SEARCH
// ============================================================

/**
 * Happy Path: Search users by username.
 */
test('GET /api/search - user by username', async (t) => {
    const { body } = await t.context.got('api/search?item-type=user&query=alice');

    t.true(body.success);
    if (body.data.users.length > 0) {
        const hasAlice = body.data.users.some(user =>
            user.username.toLowerCase().includes('alice')
        );
        t.true(hasAlice);
    }
});

// ============================================================
// RESPONSE STRUCTURE VALIDATION
// ============================================================

/**
 * Happy Path: Work includes rating information.
 */
test('GET /api/search - work includes rating info', async (t) => {
    const { body } = await t.context.got('api/search?item-type=work');

    t.true(body.success);
    if (body.data.works.length > 0) {
        const work = body.data.works[0];
        t.truthy(work.workId);
        t.truthy(work.title);
        t.true('rating' in work);
        t.true('ratingCount' in work);
    }
});

/**
 * Happy Path: User includes expected properties.
 */
test('GET /api/search - user includes properties', async (t) => {
    const { body } = await t.context.got('api/search?item-type=user');

    t.true(body.success);
    if (body.data.users.length > 0) {
        const user = body.data.users[0];
        t.truthy(user.userId);
        t.truthy(user.username);
        t.truthy(user.email);
    }
});

/**
 * Happy Path: Metadata matches array lengths.
 */
test('GET /api/search - metadata counts match', async (t) => {
    const { body } = await t.context.got('api/search');

    t.true(body.success);
    t.is(body.data.totalWorks, body.data.works.length);
    t.is(body.data.totalUsers, body.data.users.length);
});
