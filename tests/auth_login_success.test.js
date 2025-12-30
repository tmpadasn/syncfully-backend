/**
 * ============================================================
 * AUTH LOGIN SUCCESS TESTS
 * ============================================================
 * Tests for successful login scenarios.
 * 
 * This file covers successful authentication flows including
 * logging in with username, email, and testing wrong credentials.
 * 
 * Endpoint covered:
 * - POST /api/auth/login
 * 
 * Test categories:
 * - Happy Path: Successful login scenarios
 * - Unhappy Path: Wrong password, non-existent user
 * 
 * @module tests/auth_login_success
 */

import test from 'ava';
import got from 'got';
import listen from 'test-listen';
import http from 'http';
import app from '../app.js';

// ============================================================
// TEST SETUP & TEARDOWN
// ============================================================

/**
 * Before all tests:
 * - Create HTTP server with the Express app
 * - Get a unique URL for testing
 * - Configure got client with test URL
 */
test.before(async (t) => {
    t.context.server = http.createServer(app);
    t.context.prefixUrl = await listen(t.context.server);
    t.context.got = got.extend({ prefixUrl: t.context.prefixUrl, responseType: 'json' });
});

/**
 * After all tests:
 * - Close the HTTP server to free resources
 */
test.after.always((t) => {
    t.context.server.close();
});

// ============================================================
// LOGIN WITH USERNAME
// ============================================================
// Tests for logging in using the username as the identifier.

/**
 * Happy Path: User logs in successfully with their username.
 * Expected: 200 OK, user data returned with userId, username, email.
 */
test('Login with username - success', async (t) => {
    const loginData = {
        identifier: 'alice',
        password: 'alice'
    };

    const { body } = await t.context.got.post('api/auth/login', { json: loginData });

    t.true(body.success);
    t.truthy(body.data);
    t.is(body.data.username, 'alice');
    t.truthy(body.data.userId);
    t.truthy(body.data.email);
    t.is(body.message, 'Login successful');
});

/**
 * Unhappy Path: User provides wrong password for a valid username.
 * Expected: 401 Unauthorized.
 */
test('Login with username - wrong password', async (t) => {
    const loginData = {
        identifier: 'alice',
        password: 'wrongpassword'
    };

    try {
        await t.context.got.post('api/auth/login', { json: loginData });
        t.fail('Should have thrown an error');
    } catch (error) {
        t.is(error.response.statusCode, 401);
        t.regex(error.response.body.error, /invalid credentials|incorrect password/i);
    }
});

/**
 * Unhappy Path: User tries to log in with a username that doesn't exist.
 * Expected: 401 Unauthorized.
 */
test('Login with username - non-existent user', async (t) => {
    const loginData = {
        identifier: 'nonexistentuser',
        password: 'password123'
    };

    try {
        await t.context.got.post('api/auth/login', { json: loginData });
        t.fail('Should have thrown an error');
    } catch (error) {
        t.is(error.response.statusCode, 401);
        t.regex(error.response.body.error, /not found|invalid credentials/i);
    }
});

// ============================================================
// LOGIN WITH EMAIL
// ============================================================
// Tests for logging in using the email as the identifier.

/**
 * Happy Path: User logs in successfully with their email.
 * Expected: 200 OK, user data returned.
 */
test('Login with email - success', async (t) => {
    const loginData = {
        identifier: 'bob@example.com',
        password: 'bob'
    };

    const { body } = await t.context.got.post('api/auth/login', { json: loginData });

    t.true(body.success);
    t.truthy(body.data);
    t.is(body.data.username, 'bob');
    t.is(body.data.email, 'bob@example.com');
});
