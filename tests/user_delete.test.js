/**
 * ============================================================
 * USER DELETE TESTS
 * ============================================================
 * Tests for deleting users.
 * 
 * Endpoint covered:
 * - DELETE /api/users/:userId - Delete user
 * 
 * @module tests/user_delete
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
// DELETE /api/users/:userId - DELETE USER
// ============================================================

/** Happy Path: Delete a user. */
test('DELETE /api/users/:userId - deletes user', async (t) => {
    const newUser = { username: 'deleteme', email: 'delete@example.com', password: 'password123' };
    const { body: created } = await t.context.got.post('api/users', { json: newUser });
    const userId = created.data.userId;

    const { statusCode } = await t.context.got.delete(`api/users/${userId}`);
    t.is(statusCode, 204);

    try {
        await t.context.got(`api/users/${userId}`);
    } catch (error) {
        t.is(error.response.statusCode, 404);
    }
});

/** Unhappy Path: Delete non-existent user. */
test('DELETE /api/users/:userId - 404 for non-existent user', async (t) => {
    try {
        await t.context.got.delete('api/users/999999');
    } catch (error) {
        t.is(error.response.statusCode, 404);
    }
});
