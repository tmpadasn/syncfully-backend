/**
 * ============================================================
 * AUTH LOGIN VALIDATION TESTS
 * ============================================================
 * Tests for login validation errors.
 * 
 * This file covers all validation scenarios for the login endpoint,
 * including missing fields and empty values.
 * 
 * Endpoint covered:
 * - POST /api/auth/login
 * 
 * Test categories:
 * - Unhappy Path: Missing fields, empty values, validation errors
 * 
 * @module tests/auth_login_validation
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
// MISSING FIELD VALIDATION
// ============================================================
// Tests for requests missing required fields.

/**
 * Unhappy Path: Request is missing the identifier field.
 * Expected: 400 Bad Request.
 */
test('Login validation - missing identifier', async (t) => {
    const loginData = {
        password: 'password123'
    };

    try {
        await t.context.got.post('api/auth/login', { json: loginData });
        t.fail('Should have thrown an error');
    } catch (error) {
        t.is(error.response.statusCode, 400);
        const errorMsg = Array.isArray(error.response.body.error)
            ? error.response.body.error[0]
            : error.response.body.error;
        t.regex(errorMsg, /identifier.*required/i);
    }
});

/**
 * Unhappy Path: Request is missing the password field.
 * Expected: 400 Bad Request.
 */
test('Login validation - missing password', async (t) => {
    const loginData = {
        identifier: 'alice'
    };

    try {
        await t.context.got.post('api/auth/login', { json: loginData });
        t.fail('Should have thrown an error');
    } catch (error) {
        t.is(error.response.statusCode, 400);
        const errorMsg = Array.isArray(error.response.body.error)
            ? error.response.body.error[0]
            : error.response.body.error;
        t.regex(errorMsg, /password.*required/i);
    }
});

// ============================================================
// EMPTY FIELD VALIDATION
// ============================================================
// Tests for requests with empty field values.

/**
 * Unhappy Path: Identifier is an empty string.
 * Expected: 400 Bad Request.
 */
test('Login validation - empty identifier', async (t) => {
    const loginData = {
        identifier: '',
        password: 'password123'
    };

    try {
        await t.context.got.post('api/auth/login', { json: loginData });
        t.fail('Should have thrown an error');
    } catch (error) {
        t.is(error.response.statusCode, 400);
    }
});

/**
 * Unhappy Path: Password is an empty string.
 * Expected: 400 Bad Request.
 */
test('Login validation - empty password', async (t) => {
    const loginData = {
        identifier: 'alice',
        password: ''
    };

    try {
        await t.context.got.post('api/auth/login', { json: loginData });
        t.fail('Should have thrown an error');
    } catch (error) {
        t.is(error.response.statusCode, 400);
    }
});
