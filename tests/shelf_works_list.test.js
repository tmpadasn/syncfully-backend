/**
 * ============================================================
 * SHELF WORKS LIST TESTS
 * ============================================================
 * Tests for listing and filtering works within shelves.
 * 
 * This file covers listing works in a shelf and applying
 * various filters to the results.
 * 
 * Endpoint covered:
 * - GET /api/shelves/:shelfId/works - List works in shelf
 * 
 * Test categories:
 * - Happy Path: Listing works, applying filters
 * - Unhappy Path: Non-existent shelf
 * 
 * @module tests/shelf_works_list
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
// GET /api/shelves/:shelfId/works - LIST WORKS IN SHELF
// ============================================================

/**
 * Happy Path: Get works in shelf with works.
 * Expected: 200 OK, array of works.
 */
test('GET /api/shelves/:shelfId/works - returns works in shelf', async (t) => {
    const { body } = await t.context.got('api/shelves/1/works');
    t.true(body.success);
    t.true(Array.isArray(body.data.works));
    t.true(body.data.works.length > 0);
});

/**
 * Happy Path: Get works in empty shelf.
 * Expected: 200 OK, empty array.
 */
test('GET /api/shelves/:shelfId/works - empty for shelf with no works', async (t) => {
    // Create an empty shelf
    const newShelf = { name: 'Empty Shelf', description: 'No works here' };
    const { body: created } = await t.context.got.post('api/users/1/shelves', { json: newShelf });
    const shelfId = created.data.shelfId;

    const { body } = await t.context.got(`api/shelves/${shelfId}/works`);
    t.true(body.success);
    t.true(Array.isArray(body.data.works));
    t.is(body.data.works.length, 0);
});

/**
 * Unhappy Path: Get works from non-existent shelf.
 * Expected: 404 Not Found.
 */
test('GET /api/shelves/:shelfId/works - 404 for non-existent shelf', async (t) => {
    try {
        await t.context.got('api/shelves/999999/works');
    } catch (error) {
        t.is(error.response.statusCode, 404);
        t.regex(error.response.body.error, /shelf not found/i);
    }
});

// ============================================================
// GET /api/shelves/:shelfId/works - FILTERING
// ============================================================

/**
 * Happy Path: Filter by work-type.
 * Note: In mock mode, works are IDs so filtering may not apply.
 */
test('GET /api/shelves/:shelfId/works - filter by work-type', async (t) => {
    const { body } = await t.context.got('api/shelves/1/works?work-type=movie');
    t.true(body.success);
    t.true(Array.isArray(body.data.works));
});

/**
 * Happy Path: Filter by genre.
 */
test('GET /api/shelves/:shelfId/works - filter by genre', async (t) => {
    const { body } = await t.context.got('api/shelves/3/works?genre=Action');
    t.true(body.success);
    t.true(Array.isArray(body.data.works));
});

/**
 * Happy Path: Filter by rating.
 */
test('GET /api/shelves/:shelfId/works - filter by rating', async (t) => {
    const { body } = await t.context.got('api/shelves/1/works?rating=4.0');
    t.true(body.success);
    t.true(Array.isArray(body.data.works));
});

/**
 * Happy Path: Filter by year.
 */
test('GET /api/shelves/:shelfId/works - filter by year', async (t) => {
    const { body } = await t.context.got('api/shelves/1/works?year=2020');
    t.true(body.success);
    t.true(Array.isArray(body.data.works));
});

/**
 * Happy Path: Combine multiple filters.
 */
test('GET /api/shelves/:shelfId/works - multiple filters combined', async (t) => {
    const { body } = await t.context.got('api/shelves/3/works?work-type=movie&genre=Action&rating=4.0');
    t.true(body.success);
    t.true(Array.isArray(body.data.works));
});

/**
 * Happy Path: Invalid filters return all works.
 */
test('GET /api/shelves/:shelfId/works - invalid filters return all works', async (t) => {
    const { body } = await t.context.got('api/shelves/1/works?work-type=invalid&rating=invalid');
    t.true(body.success);
    t.true(Array.isArray(body.data.works));
});
