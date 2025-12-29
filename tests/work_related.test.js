/**
 * ============================================================
 * WORK RELATED TESTS
 * ============================================================
 * Tests for popular and similar works functionality.
 * 
 * This file covers fetching popular works and
 * getting similar works for a specific work.
 * 
 * Endpoints covered:
 * - GET /api/works/popular - Get popular works
 * - GET /api/works/:workId/similar - Get similar works
 * 
 * Test categories:
 * - Happy Path: Popular works, similar works
 * - Unhappy Path: Non-existent work
 * 
 * @module tests/work_related
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
// GET /api/works/popular - POPULAR WORKS
// ============================================================

/**
 * Happy Path: Get popular works.
 * Expected: 200 OK, array of works.
 */
test('GET /api/works/popular - returns popular works', async (t) => {
    const { body } = await t.context.got('api/works/popular');
    t.true(Array.isArray(body.data.works));
    t.true(body.success);
});

/**
 * Happy Path: Respects implicit limit.
 * Expected: Maximum 10 works returned.
 */
test('GET /api/works/popular - respects limit', async (t) => {
    const { body } = await t.context.got('api/works/popular');
    t.true(body.data.works.length <= 10);
    t.true(body.success);
});

// ============================================================
// GET /api/works/:workId/similar - SIMILAR WORKS
// ============================================================

/**
 * Happy Path: Get similar works.
 * Expected: 200 OK, array of works.
 */
test('GET /api/works/:workId/similar - returns similar works', async (t) => {
    const { body } = await t.context.got('api/works/1/similar');
    t.true(Array.isArray(body.data.works));
    t.true(body.success);
});

/**
 * Happy Path: Similar works for different type.
 */
test('GET /api/works/:workId/similar - works for music', async (t) => {
    const { body } = await t.context.got('api/works/4/similar');
    t.true(Array.isArray(body.data.works));
    t.true(body.success);
});

/**
 * Unhappy Path: Non-existent work.
 * Expected: 404 Not Found.
 */
test('GET /api/works/:workId/similar - 404 for non-existent work', async (t) => {
    try {
        await t.context.got('api/works/999999/similar');
    } catch (error) {
        t.is(error.response.statusCode, 404);
    }
});
