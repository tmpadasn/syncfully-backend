/**
 * ============================================================
 * SHELF USER TESTS
 * ============================================================
 * Tests for user-scoped shelf operations.
 * 
 * This file covers listing a user's shelves and creating
 * new shelves for a user.
 * 
 * Endpoints covered:
 * - GET /api/users/:userId/shelves - List user's shelves
 * - POST /api/users/:userId/shelves - Create new shelf
 * 
 * Test categories:
 * - Happy Path: Expected successful behavior
 * - Unhappy Path: Error handling and edge cases
 * 
 * @module tests/shelf_user
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
// GET /api/users/:userId/shelves - LIST USER'S SHELVES
// ============================================================

/**
 * Happy Path: Get shelves for a user.
 * Expected: 200 OK, array of shelves belonging to user.
 */
test('GET /api/users/:userId/shelves - returns user shelves', async (t) => {
    const { body } = await t.context.got('api/users/1/shelves');
    t.true(body.success);
    t.true(Array.isArray(body.data.shelves));
    t.true(body.data.shelves.length > 0);

    // All shelves should belong to user 1
    body.data.shelves.forEach(shelf => {
        t.is(shelf.userId, 1);
    });
});

/**
 * Happy Path: Get shelves for user with no shelves.
 * Expected: 200 OK, empty array.
 */
test('GET /api/users/:userId/shelves - empty for user with no shelves', async (t) => {
    // Create a new user with no shelves
    const newUser = { username: 'noshelves', email: 'noshelves@example.com', password: 'password123' };
    const { body: created } = await t.context.got.post('api/users', { json: newUser });
    const userId = created.data.userId;

    const { body } = await t.context.got(`api/users/${userId}/shelves`);
    t.true(body.success);
    t.true(Array.isArray(body.data.shelves));
    t.is(body.data.shelves.length, 0);
});

/**
 * Unhappy Path: Get shelves for non-existent user.
 * Note: In mock mode, returns empty array instead of 404.
 */
test('GET /api/users/:userId/shelves - empty for non-existent user (mock mode)', async (t) => {
    const { body } = await t.context.got('api/users/999999/shelves');
    t.true(body.success);
    t.true(Array.isArray(body.data.shelves));
    t.is(body.data.shelves.length, 0);
});

// ============================================================
// POST /api/users/:userId/shelves - CREATE SHELF
// ============================================================

/**
 * Happy Path: Create a new shelf with name and description.
 * Expected: 201 Created, shelf data returned with empty works array.
 */
test('POST /api/users/:userId/shelves - creates new shelf', async (t) => {
    const newShelf = { name: 'My New Collection', description: 'A fresh new collection of works' };
    const { body } = await t.context.got.post('api/users/1/shelves', { json: newShelf });

    t.true(body.success);
    t.is(body.data.name, newShelf.name);
    t.is(body.data.description, newShelf.description);
    t.is(body.data.userId, 1);
    t.truthy(body.data.shelfId);
    t.true(Array.isArray(body.data.works));
    t.is(body.data.works.length, 0);
});

/**
 * Happy Path: Create shelf without description.
 * Expected: 201 Created, description defaults to empty string.
 */
test('POST /api/users/:userId/shelves - creates shelf without description', async (t) => {
    const newShelf = { name: 'Simple Collection' };
    const { body } = await t.context.got.post('api/users/2/shelves', { json: newShelf });

    t.true(body.success);
    t.is(body.data.name, newShelf.name);
    t.is(body.data.description, '');
    t.is(body.data.userId, 2);
});

/**
 * Happy Path: Name and description are trimmed.
 * Expected: 201 Created, whitespace removed.
 */
test('POST /api/users/:userId/shelves - trims whitespace', async (t) => {
    const newShelf = { name: '  Trimmed Collection  ', description: '  This should be trimmed  ' };
    const { body } = await t.context.got.post('api/users/3/shelves', { json: newShelf });

    t.true(body.success);
    t.is(body.data.name, 'Trimmed Collection');
    t.is(body.data.description, 'This should be trimmed');
});

/**
 * Unhappy Path: Missing name field.
 * Expected: 400 Bad Request.
 */
test('POST /api/users/:userId/shelves - 400 for missing name', async (t) => {
    const newShelf = { description: 'Collection without name' };

    try {
        await t.context.got.post('api/users/1/shelves', { json: newShelf });
    } catch (error) {
        t.is(error.response.statusCode, 400);
        const errorMsg = Array.isArray(error.response.body.error)
            ? error.response.body.error[0]
            : error.response.body.error;
        t.regex(errorMsg, /name is required/i);
    }
});

/**
 * Unhappy Path: Empty name (whitespace only).
 * Expected: 400 Bad Request.
 */
test('POST /api/users/:userId/shelves - 400 for empty name', async (t) => {
    const newShelf = { name: '   ', description: 'Collection with empty name' };

    try {
        await t.context.got.post('api/users/1/shelves', { json: newShelf });
    } catch (error) {
        t.is(error.response.statusCode, 400);
        t.regex(error.response.body.error, /name is required/i);
    }
});
