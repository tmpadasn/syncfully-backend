/**
 * ============================================================
 * SHELF WORKS REMOVE & INTEGRATION TESTS
 * ============================================================
 * Tests for removing works from shelves and integration tests.
 * 
 * Endpoint covered:
 * - DELETE /api/shelves/:shelfId/works/:workId - Remove work from shelf
 * 
 * @module tests/shelf_works_remove
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
// DELETE /api/shelves/:shelfId/works/:workId - REMOVE WORK
// ============================================================

/** Happy Path: Remove a work from a shelf. */
test('DELETE remove work - removes work from shelf', async (t) => {
    const newShelf = { name: 'Test Remove Work', description: 'Testing removing works' };
    const { body: created } = await t.context.got.post('api/users/1/shelves', { json: newShelf });
    const shelfId = created.data.shelfId;

    await t.context.got.post(`api/shelves/${shelfId}/works/20`);
    const { body } = await t.context.got.delete(`api/shelves/${shelfId}/works/20`);
    t.true(body.success);
    t.false(body.data.works.includes(20));
});

/** Happy Path: Remove specific work only (others remain). */
test('DELETE remove work - removes only specified work', async (t) => {
    const newShelf = { name: 'Test Selective Remove', description: 'Testing selective work removal' };
    const { body: created } = await t.context.got.post('api/users/1/shelves', { json: newShelf });
    const shelfId = created.data.shelfId;

    await t.context.got.post(`api/shelves/${shelfId}/works/25`);
    await t.context.got.post(`api/shelves/${shelfId}/works/30`);
    await t.context.got.post(`api/shelves/${shelfId}/works/35`);

    const { body } = await t.context.got.delete(`api/shelves/${shelfId}/works/30`);
    t.true(body.success);
    t.true(body.data.works.includes(25));
    t.false(body.data.works.includes(30));
    t.true(body.data.works.includes(35));
    t.is(body.data.works.length, 2);
});

/** Happy Path: Removing work not in shelf doesn't cause error. */
test('DELETE remove work - no error if work not in shelf', async (t) => {
    const { body } = await t.context.got.delete('api/shelves/1/works/999');
    t.true(body.success);
});

/** Unhappy Path: Remove work from non-existent shelf. */
test('DELETE remove work - 404 for non-existent shelf', async (t) => {
    try {
        await t.context.got.delete('api/shelves/999999/works/1');
    } catch (error) {
        t.is(error.response.statusCode, 404);
        t.regex(error.response.body.error, /shelf not found/i);
    }
});

// ============================================================
// INTEGRATION TEST
// ============================================================

/** Integration Test: Full shelf workflow. */
test('Integration - complex shelf operations work together', async (t) => {
    const newUser = { username: 'complexuser', email: 'complex@example.com', password: 'password123' };
    const { body: userCreated } = await t.context.got.post('api/users', { json: newUser });
    const userId = userCreated.data.userId;

    const newShelf = { name: 'Complex Operations', description: 'Testing complex shelf operations' };
    const { body: shelfCreated } = await t.context.got.post(`api/users/${userId}/shelves`, { json: newShelf });
    const shelfId = shelfCreated.data.shelfId;

    await t.context.got.post(`api/shelves/${shelfId}/works/1`);
    await t.context.got.post(`api/shelves/${shelfId}/works/2`);
    await t.context.got.post(`api/shelves/${shelfId}/works/3`);

    const { body: works } = await t.context.got(`api/shelves/${shelfId}/works`);
    t.is(works.data.works.length, 3);

    const updateData = { name: 'Updated Complex Operations' };
    const { body: updated } = await t.context.got.put(`api/shelves/${shelfId}`, { json: updateData });
    t.is(updated.data.name, updateData.name);

    await t.context.got.delete(`api/shelves/${shelfId}/works/2`);
    const { body: afterRemove } = await t.context.got(`api/shelves/${shelfId}/works`);
    t.is(afterRemove.data.works.length, 2);
    t.false(afterRemove.data.works.includes(2));

    const { body: userShelves } = await t.context.got(`api/users/${userId}/shelves`);
    t.true(userShelves.data.shelves.some(s => s.shelfId === shelfId));
});
