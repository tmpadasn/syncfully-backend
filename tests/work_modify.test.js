/**
 * ============================================================
 * WORK UPDATE & DELETE TESTS
 * ============================================================
 * Tests for updating and deleting works.
 * 
 * Endpoints covered:
 * - PUT /api/works/:workId - Update work
 * - DELETE /api/works/:workId - Delete work
 * 
 * @module tests/work_modify
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
// PUT /api/works/:workId - UPDATE WORK
// ============================================================

/** Happy Path: Update a work's title. */
test('PUT /api/works/:workId - updates work', async (t) => {
    const newWork = { title: 'Work to Update', type: 'book' };
    const { body: created } = await t.context.got.post('api/works', { json: newWork });
    const workId = created.data.workId;

    const updateData = { title: 'Updated Work Title' };
    const { body: updated } = await t.context.got.put(`api/works/${workId}`, { json: updateData });
    t.true(updated.success);
    t.is(updated.data.title, updateData.title);
});

/** Happy Path: Update multiple fields. */
test('PUT /api/works/:workId - updates multiple fields', async (t) => {
    const newWork = { title: 'Multi Update', type: 'music', year: 2000 };
    const { body: created } = await t.context.got.post('api/works', { json: newWork });
    const workId = created.data.workId;

    const updateData = { title: 'Updated Multi', year: 2001 };
    const { body: updated } = await t.context.got.put(`api/works/${workId}`, { json: updateData });
    t.true(updated.success);
    t.is(updated.data.title, updateData.title);
    t.is(updated.data.year, updateData.year);
});

/** Unhappy Path: Non-existent work. */
test('PUT /api/works/:workId - 404 for non-existent work', async (t) => {
    try {
        await t.context.got.put('api/works/999999', { json: { title: 'Updated Work Title' } });
    } catch (error) {
        t.is(error.response.statusCode, 404);
    }
});

// ============================================================
// DELETE /api/works/:workId - DELETE WORK
// ============================================================

/** Happy Path: Delete a work. */
test('DELETE /api/works/:workId - deletes work', async (t) => {
    const newWork = { title: 'Work to Delete', type: 'music' };
    const { body: created } = await t.context.got.post('api/works', { json: newWork });
    const workId = created.data.workId;

    const { statusCode } = await t.context.got.delete(`api/works/${workId}`);
    t.is(statusCode, 204);

    try {
        await t.context.got(`api/works/${workId}`);
    } catch (error) {
        t.is(error.response.statusCode, 404);
    }
});

/** Happy Path: Delete another work. */
test('DELETE /api/works/:workId - deletes another work', async (t) => {
    const newWork = { title: 'Another Delete', type: 'movie' };
    const { body: created } = await t.context.got.post('api/works', { json: newWork });
    const workId = created.data.workId;

    const { statusCode } = await t.context.got.delete(`api/works/${workId}`);
    t.is(statusCode, 204);
});

/** Unhappy Path: Non-existent work. */
test('DELETE /api/works/:workId - 404 for non-existent work', async (t) => {
    try {
        await t.context.got.delete('api/works/999999');
    } catch (error) {
        t.is(error.response.statusCode, 404);
    }
});
