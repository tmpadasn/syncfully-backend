/**
 * ============================================================
 * WORK LIST & GET TESTS
 * ============================================================
 * Tests for listing and retrieving works.
 * 
 * Endpoints covered:
 * - GET /api/works - List all works
 * - GET /api/works/:workId - Get single work
 * 
 * @module tests/work_list
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
// GET /api/works - LIST ALL WORKS
// ============================================================

/** Happy Path: Get all works. */
test('GET /api/works - returns all works', async (t) => {
    const { body } = await t.context.got('api/works');
    t.true(Array.isArray(body.data.works));
    t.true(body.success);
});

/** Happy Path: Filter by type. */
test('GET /api/works - filters by type', async (t) => {
    const { body } = await t.context.got('api/works?type=movie');
    t.true(Array.isArray(body.data.works));
    t.true(body.success);
    body.data.works.forEach(work => {
        t.is(work.type, 'movie');
    });
});

/** Happy Path: Invalid filter ignored. */
test('GET /api/works - ignores invalid filter', async (t) => {
    const { body } = await t.context.got('api/works?invalidparam=something');
    t.true(Array.isArray(body.data.works));
    t.true(body.success);
});

// ============================================================
// GET /api/works/:workId - GET SINGLE WORK
// ============================================================

/** Happy Path: Get work by ID. */
test('GET /api/works/:workId - returns work by ID', async (t) => {
    const { body } = await t.context.got('api/works/1');
    t.is(body.data.workId, 1);
    t.true(body.success);
});

/** Happy Path: Get another work by ID. */
test('GET /api/works/:workId - returns another work', async (t) => {
    const { body } = await t.context.got('api/works/2');
    t.is(body.data.workId, 2);
    t.true(body.success);
});

/** Unhappy Path: Non-existent work. */
test('GET /api/works/:workId - 404 for non-existent work', async (t) => {
    try {
        await t.context.got('api/works/999999');
    } catch (error) {
        t.is(error.response.statusCode, 404);
    }
});
