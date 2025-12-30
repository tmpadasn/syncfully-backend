/**
 * ============================================================
 * SHELF WORKS ADD TESTS
 * ============================================================
 * Tests for adding works to shelves.
 * 
 * Endpoint covered:
 * - POST /api/shelves/:shelfId/works/:workId - Add work to shelf
 * 
 * @module tests/shelf_works_add
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
// POST /api/shelves/:shelfId/works/:workId - ADD WORK TO SHELF
// ============================================================

/** Happy Path: Add a work to a shelf. */
test('POST add work - adds work to shelf', async (t) => {
    const newShelf = { name: 'Test Add Work', description: 'Testing adding works' };
    const { body: created } = await t.context.got.post('api/users/1/shelves', { json: newShelf });
    const shelfId = created.data.shelfId;

    const { body } = await t.context.got.post(`api/shelves/${shelfId}/works/5`);
    t.true(body.success);
    t.true(body.data.works.includes(5));
});

/** Happy Path: Add multiple works to a shelf. */
test('POST add work - adds multiple works', async (t) => {
    const newShelf = { name: 'Test Multiple Works', description: 'Testing multiple works' };
    const { body: created } = await t.context.got.post('api/users/1/shelves', { json: newShelf });
    const shelfId = created.data.shelfId;

    await t.context.got.post(`api/shelves/${shelfId}/works/10`);
    const { body } = await t.context.got.post(`api/shelves/${shelfId}/works/15`);

    t.true(body.success);
    t.true(body.data.works.includes(10));
    t.true(body.data.works.includes(15));
    t.is(body.data.works.length, 2);
});

/** Happy Path: Adding duplicate work doesn't create duplicates. */
test('POST add work - prevents duplicate works', async (t) => {
    const { body } = await t.context.got.post('api/shelves/1/works/1');
    t.true(body.success);
    const workCount = body.data.works.filter(id => id === 1).length;
    t.is(workCount, 1);
});

/** Unhappy Path: Add work to non-existent shelf. */
test('POST add work - 404 for non-existent shelf', async (t) => {
    try {
        await t.context.got.post('api/shelves/999999/works/1');
    } catch (error) {
        t.is(error.response.statusCode, 404);
        t.regex(error.response.body.error, /shelf not found/i);
    }
});

/** Note: In mock mode, invalid work IDs are accepted. */
test('POST add work - accepts invalid work ID in mock mode', async (t) => {
    const { body } = await t.context.got.post('api/shelves/1/works/999999');
    t.true(body.success);
});
