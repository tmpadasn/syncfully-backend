/**
 * ============================================================
 * USER LIST & GET TESTS
 * ============================================================
 * Tests for listing and retrieving users.
 * 
 * Endpoints covered:
 * - GET /api/users - List all users
 * - GET /api/users/:userId - Get single user
 * 
 * @module tests/user_list
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
// GET /api/users - LIST ALL USERS
// ============================================================

/** Happy Path: Fetch all users. */
test('GET /api/users - returns all users', async (t) => {
    const { body } = await t.context.got('api/users');
    t.true(Array.isArray(body.data));
    t.true(body.success);
    t.true(body.data.length > 0);
});

/** Happy Path: Verify user object properties. */
test('GET /api/users - includes user properties', async (t) => {
    const { body } = await t.context.got('api/users');
    const user = body.data[0];
    t.truthy(user.userId);
    t.truthy(user.username);
    t.truthy(user.email);
});

// ============================================================
// GET /api/users/:userId - GET SINGLE USER
// ============================================================

/** Happy Path: Fetch user with ID 1 (alice). */
test('GET /api/users/:userId - returns user by ID', async (t) => {
    const { body } = await t.context.got('api/users/1');
    t.is(body.data.userId, 1);
    t.is(body.data.username, 'alice');
    t.true(body.success);
});

/** Happy Path: Fetch user with ID 2 (bob). */
test('GET /api/users/:userId - returns another user by ID', async (t) => {
    const { body } = await t.context.got('api/users/2');
    t.is(body.data.userId, 2);
    t.is(body.data.username, 'bob');
    t.true(body.success);
});

/** Unhappy Path: Fetch non-existent user. */
test('GET /api/users/:userId - 404 for non-existent user', async (t) => {
    try {
        await t.context.got('api/users/999999');
    } catch (error) {
        t.is(error.response.statusCode, 404);
    }
});

/** Unhappy Path: Invalid user ID format (non-numeric). */
test('GET /api/users/:userId - 400 for invalid ID format', async (t) => {
    try {
        await t.context.got('api/users/invalid');
    } catch (error) {
        t.is(error.response.statusCode, 400);
    }
});
