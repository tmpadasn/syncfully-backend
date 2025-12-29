/**
 * ============================================================
 * WORK CREATE TESTS
 * ============================================================
 * Tests for creating works.
 * 
 * Endpoint covered:
 * - POST /api/works - Create work
 * 
 * @module tests/work_create
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
// POST /api/works - CREATE WORK
// ============================================================

/** Happy Path: Create a new work. */
test('POST /api/works - creates new work', async (t) => {
    const newWork = { title: 'Test Work', type: 'movie', year: 2023, genres: ['Action'] };
    const { body } = await t.context.got.post('api/works', { json: newWork });

    t.true(body.success);
    t.is(body.data.title, newWork.title);
    t.truthy(body.data.workId);
});

/** Happy Path: Create work with minimal fields. */
test('POST /api/works - creates with minimal fields', async (t) => {
    const newWork = { title: 'Minimal Work', type: 'book' };
    const { body } = await t.context.got.post('api/works', { json: newWork });

    t.true(body.success);
    t.is(body.data.title, newWork.title);
    t.truthy(body.data.workId);
});

/** Unhappy Path: Missing required fields. */
test('POST /api/works - 400 for missing fields', async (t) => {
    try {
        await t.context.got.post('api/works', { json: { year: 2023 } });
    } catch (error) {
        t.is(error.response.statusCode, 400);
    }
});
