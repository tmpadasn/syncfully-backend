/**
 * ============================================================
 * AUTH SIGNUP SUCCESS TESTS
 * ============================================================
 * Tests for successful user registration scenarios.
 * 
 * This file covers successful signup flows and duplicate credential errors.
 * 
 * Endpoint covered:
 * - POST /api/auth/signup
 * 
 * Test categories:
 * - Happy Path: Successful user creation
 * - Unhappy Path: Duplicate username/email errors
 * 
 * @module tests/auth_signup_success
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
// SUCCESSFUL USER CREATION
// ============================================================
// Tests for successfully creating a new user.

/**
 * Happy Path: Create a new user with all required fields.
 * Expected: 201 Created, user data returned (without password).
 */
test('Signup - create new user successfully', async (t) => {
    const signupData = {
        username: 'newuser',
        email: 'newuser@example.com',
        password: 'password123'
    };

    const { body } = await t.context.got.post('api/auth/signup', { json: signupData });

    t.true(body.success);
    t.truthy(body.data);
    t.is(body.data.username, signupData.username);
    t.is(body.data.email, signupData.email);
    t.truthy(body.data.userId);
    t.falsy(body.data.password); // Password should not be returned
    t.is(body.message, 'User successfully created');
});

/**
 * Happy Path: Create a new user with an optional profile picture.
 * Expected: 201 Created, user data includes profilePictureUrl.
 */
test('Signup - create user with profile picture', async (t) => {
    const signupData = {
        username: 'userWithPic',
        email: 'userwithpic@example.com',
        password: 'password123',
        profilePictureUrl: 'http://example.com/pic.jpg'
    };

    const { body } = await t.context.got.post('api/auth/signup', { json: signupData });

    t.true(body.success);
    t.is(body.data.profilePictureUrl, signupData.profilePictureUrl);
});

// ============================================================
// DUPLICATE USER ERRORS
// ============================================================
// Tests for attempting to create a user with existing credentials.

/**
 * Unhappy Path: Attempt to create a user with a username that already exists.
 * Expected: 400 Bad Request.
 */
test('Signup duplicate - username already exists', async (t) => {
    const signupData = {
        username: 'alice', // Already exists in mock data
        email: 'newalice@example.com',
        password: 'password123'
    };

    try {
        await t.context.got.post('api/auth/signup', { json: signupData });
        t.fail('Should have thrown an error');
    } catch (error) {
        t.is(error.response.statusCode, 400);
        t.regex(error.response.body.error, /already exists/i);
    }
});

/**
 * Unhappy Path: Attempt to create a user with an email that already exists.
 * Expected: 400 Bad Request.
 */
test('Signup duplicate - email already exists', async (t) => {
    const signupData = {
        username: 'newalice',
        email: 'alice@example.com', // Already exists in mock data
        password: 'password123'
    };

    try {
        await t.context.got.post('api/auth/signup', { json: signupData });
        t.fail('Should have thrown an error');
    } catch (error) {
        t.is(error.response.statusCode, 400);
        t.regex(error.response.body.error, /already exists/i);
    }
});
