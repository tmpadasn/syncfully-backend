/**
 * ============================================================
 * SHELF LIST & GET TESTS
 * ============================================================
 * Tests for listing and retrieving shelves.
 * 
 * Endpoints covered:
 * - GET /api/shelves - List all shelves
 * - GET /api/shelves/:shelfId - Get single shelf
 * 
 * @module tests/shelf_list
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
// GET /api/shelves - LIST ALL SHELVES
// ============================================================

/** Happy Path: Fetch all shelves. */
test('GET /api/shelves - returns all shelves', async (t) => {
    const { body } = await t.context.got('api/shelves');
    t.true(Array.isArray(body.data.shelves));
    t.true(body.success);
    t.true(body.data.shelves.length > 0);
});

/** Happy Path: Verify shelf object properties. */
test('GET /api/shelves - includes shelf properties', async (t) => {
    const { body } = await t.context.got('api/shelves');
    const shelf = body.data.shelves[0];
    t.truthy(shelf.shelfId);
    t.truthy(shelf.name);
    t.truthy(shelf.userId);
    t.truthy(shelf.description);
    t.true(Array.isArray(shelf.works));
});

// ============================================================
// GET /api/shelves/:shelfId - GET SINGLE SHELF
// ============================================================

/** Happy Path: Fetch shelf by ID. */
test('GET /api/shelves/:shelfId - returns shelf by ID', async (t) => {
    const { body } = await t.context.got('api/shelves/1');
    t.is(body.data.shelfId, 1);
    t.is(body.data.name, 'Drama Favorites');
    t.is(body.data.userId, 1);
    t.true(body.success);
});

/** Happy Path: Fetch another shelf by ID. */
test('GET /api/shelves/:shelfId - returns another shelf by ID', async (t) => {
    const { body } = await t.context.got('api/shelves/3');
    t.is(body.data.shelfId, 3);
    t.is(body.data.name, 'Action Packed');
    t.is(body.data.userId, 2);
    t.true(body.success);
});

/** Unhappy Path: Fetch non-existent shelf. */
test('GET /api/shelves/:shelfId - 404 for non-existent shelf', async (t) => {
    try {
        await t.context.got('api/shelves/999999');
    } catch (error) {
        t.is(error.response.statusCode, 404);
        t.regex(error.response.body.error, /shelf not found/i);
    }
});

/** Unhappy Path: Invalid shelf ID format. */
test('GET /api/shelves/:shelfId - 400 for invalid ID format', async (t) => {
    try {
        await t.context.got('api/shelves/invalid');
    } catch (error) {
        t.is(error.response.statusCode, 400);
    }
});
