/**
 * ============================================================
 * USER CREATE TESTS
 * ============================================================
 * Tests for creating users.
 * 
 * Endpoint covered:
 * - POST /api/users - Create user
 * 
 * @module tests/user_create
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
// POST /api/users - CREATE USER
// ============================================================

/** Happy Path: Create a new user with required fields. */
test('POST /api/users - creates new user', async (t) => {
    const newUser = { username: 'testuser', email: 'test@example.com', password: 'password123' };
    const { body } = await t.context.got.post('api/users', { json: newUser });

    t.true(body.success);
    t.is(body.data.username, newUser.username);
    t.is(body.data.email, newUser.email);
    t.truthy(body.data.userId);
    t.falsy(body.data.password);
});

/** Happy Path: Create user with optional profile picture. */
test('POST /api/users - creates user with profile picture', async (t) => {
    const newUser = {
        username: 'pictureuser', email: 'picture@example.com',
        password: 'password123', profilePictureUrl: 'http://example.com/pic.jpg'
    };
    const { body } = await t.context.got.post('api/users', { json: newUser });

    t.true(body.success);
    t.is(body.data.profilePictureUrl, newUser.profilePictureUrl);
});

/** Unhappy Path: Missing username. */
test('POST /api/users - 400 for missing username', async (t) => {
    try {
        await t.context.got.post('api/users', { json: { email: 'test@example.com', password: 'password123' } });
    } catch (error) {
        t.is(error.response.statusCode, 400);
    }
});

/** Unhappy Path: Missing email. */
test('POST /api/users - 400 for missing email', async (t) => {
    try {
        await t.context.got.post('api/users', { json: { username: 'testuser', password: 'password123' } });
    } catch (error) {
        t.is(error.response.statusCode, 400);
    }
});

/** Unhappy Path: Missing password. */
test('POST /api/users - 400 for missing password', async (t) => {
    try {
        await t.context.got.post('api/users', { json: { username: 'testuser', email: 'test@example.com' } });
    } catch (error) {
        t.is(error.response.statusCode, 400);
    }
});

/** Unhappy Path: Duplicate username. */
test('POST /api/users - 400 for duplicate username', async (t) => {
    try {
        await t.context.got.post('api/users', { json: { username: 'alice', email: 'newalice@example.com', password: 'password123' } });
    } catch (error) {
        t.is(error.response.statusCode, 400);
    }
});

/** Unhappy Path: Duplicate email. */
test('POST /api/users - 400 for duplicate email', async (t) => {
    try {
        await t.context.got.post('api/users', { json: { username: 'newalice', email: 'alice@example.com', password: 'password123' } });
    } catch (error) {
        t.is(error.response.statusCode, 400);
    }
});
