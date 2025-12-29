/**
 * ============================================================
 * USER UPDATE TESTS
 * ============================================================
 * Tests for user update operations.
 * 
 * This file covers all scenarios for updating user information
 * including updating single fields, multiple fields, and handling
 * various error conditions.
 * 
 * Endpoint covered:
 * - PUT /api/users/:userId - Update user
 * 
 * Test categories:
 * - Happy Path: Single and multiple field updates
 * - Unhappy Path: Non-existent user, duplicate username
 * 
 * @module tests/user_update
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
// PUT /api/users/:userId - UPDATE USER
// ============================================================

/**
 * Happy Path: Update username.
 * Expected: 200 OK, updated user data.
 */
test('PUT /api/users/:userId - updates username', async (t) => {
    // Create user first
    const newUser = {
        username: 'updateme',
        email: 'update@example.com',
        password: 'password123'
    };
    const { body: created } = await t.context.got.post('api/users', { json: newUser });
    const userId = created.data.userId;

    const updateData = { username: 'updated' };
    const { body } = await t.context.got.put(`api/users/${userId}`, { json: updateData });

    t.true(body.success);
    t.is(body.data.username, updateData.username);
});

/**
 * Happy Path: Update multiple fields.
 * Expected: 200 OK, all fields updated.
 */
test('PUT /api/users/:userId - updates multiple fields', async (t) => {
    // Create user first
    const newUser = {
        username: 'multiupdate',
        email: 'multi@example.com',
        password: 'password123'
    };
    const { body: created } = await t.context.got.post('api/users', { json: newUser });
    const userId = created.data.userId;

    const updateData = {
        username: 'multiunew',
        email: 'multinew@example.com',
        profilePictureUrl: 'http://example.com/new.jpg'
    };
    const { body } = await t.context.got.put(`api/users/${userId}`, { json: updateData });

    t.true(body.success);
    t.is(body.data.username, updateData.username);
    t.is(body.data.email, updateData.email);
    t.is(body.data.profilePictureUrl, updateData.profilePictureUrl);
});

/**
 * Unhappy Path: Update non-existent user.
 * Expected: 404 Not Found.
 */
test('PUT /api/users/:userId - 404 for non-existent user', async (t) => {
    const updateData = { username: 'newname' };

    try {
        await t.context.got.put('api/users/999999', { json: updateData });
    } catch (error) {
        t.is(error.response.statusCode, 404);
    }
});

/**
 * Unhappy Path: Update to duplicate username.
 * Expected: 400 Bad Request.
 */
test('PUT /api/users/:userId - 400 for duplicate username', async (t) => {
    // Create user first
    const newUser = {
        username: 'conflictuser',
        email: 'conflict@example.com',
        password: 'password123'
    };
    const { body: created } = await t.context.got.post('api/users', { json: newUser });
    const userId = created.data.userId;

    const updateData = { username: 'alice' }; // Already exists

    try {
        await t.context.got.put(`api/users/${userId}`, { json: updateData });
    } catch (error) {
        t.is(error.response.statusCode, 400);
    }
});
