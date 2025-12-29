/**
 * ============================================================
 * SHELF UPDATE & DELETE TESTS
 * ============================================================
 * Tests for updating and deleting shelves.
 * 
 * Endpoints covered:
 * - PUT /api/shelves/:shelfId - Update shelf
 * - DELETE /api/shelves/:shelfId - Delete shelf
 * 
 * @module tests/shelf_modify
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
// PUT /api/shelves/:shelfId - UPDATE SHELF
// ============================================================

/** Happy Path: Update shelf name. */
test('PUT /api/shelves/:shelfId - updates name', async (t) => {
    const updateData = { name: 'Updated Drama Collection' };
    const { body } = await t.context.got.put('api/shelves/1', { json: updateData });
    t.true(body.success);
    t.is(body.data.name, updateData.name);
});

/** Happy Path: Update shelf description. */
test('PUT /api/shelves/:shelfId - updates description', async (t) => {
    const updateData = { description: 'Updated description for my drama favorites' };
    const { body } = await t.context.got.put('api/shelves/1', { json: updateData });
    t.true(body.success);
    t.is(body.data.description, updateData.description);
});

/** Happy Path: Update both name and description. */
test('PUT /api/shelves/:shelfId - updates name and description', async (t) => {
    const updateData = { name: 'Complete Drama Collection', description: 'All my favorite dramatic works' };
    const { body } = await t.context.got.put('api/shelves/2', { json: updateData });
    t.true(body.success);
    t.is(body.data.name, updateData.name);
    t.is(body.data.description, updateData.description);
});

/** Unhappy Path: Empty name (whitespace only). */
test('PUT /api/shelves/:shelfId - 400 for empty name', async (t) => {
    try {
        await t.context.got.put('api/shelves/1', { json: { name: '   ' } });
    } catch (error) {
        t.is(error.response.statusCode, 400);
        t.regex(error.response.body.error, /cannot be empty/i);
    }
});

/** Unhappy Path: No fields provided. */
test('PUT /api/shelves/:shelfId - 400 for no fields', async (t) => {
    try {
        await t.context.got.put('api/shelves/1', { json: {} });
    } catch (error) {
        t.is(error.response.statusCode, 400);
        t.regex(error.response.body.error, /at least one field/i);
    }
});

/** Unhappy Path: Update non-existent shelf. */
test('PUT /api/shelves/:shelfId - 404 for non-existent shelf', async (t) => {
    try {
        await t.context.got.put('api/shelves/999999', { json: { name: 'Updated Name' } });
    } catch (error) {
        t.is(error.response.statusCode, 404);
        t.regex(error.response.body.error, /shelf not found/i);
    }
});

// ============================================================
// DELETE /api/shelves/:shelfId - DELETE SHELF
// ============================================================

/** Happy Path: Delete a shelf. */
test('DELETE /api/shelves/:shelfId - deletes shelf', async (t) => {
    const newShelf = { name: 'Delete Me', description: 'This shelf will be deleted' };
    const { body: created } = await t.context.got.post('api/users/1/shelves', { json: newShelf });
    const shelfId = created.data.shelfId;

    const { statusCode } = await t.context.got.delete(`api/shelves/${shelfId}`);
    t.is(statusCode, 204);

    try {
        await t.context.got(`api/shelves/${shelfId}`);
    } catch (error) {
        t.is(error.response.statusCode, 404);
    }
});

/** Unhappy Path: Delete non-existent shelf. */
test('DELETE /api/shelves/:shelfId - 404 for non-existent shelf', async (t) => {
    try {
        await t.context.got.delete('api/shelves/999999');
    } catch (error) {
        t.is(error.response.statusCode, 404);
        t.regex(error.response.body.error, /shelf not found/i);
    }
});
