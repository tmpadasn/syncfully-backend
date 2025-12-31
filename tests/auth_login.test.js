// POST /api/auth/login tests
import test from 'ava';
import { setupTestServer, teardownTestServer } from './helpers/setup.js';

test.before(setupTestServer);
test.after.always(teardownTestServer);

// Success scenarios
test('POST /api/auth/login with username succeeds', async (t) => {
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

test('POST /api/auth/login with email succeeds', async (t) => {
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

test('POST /api/auth/login fails with wrong password', async (t) => {
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

test('POST /api/auth/login fails with non-existent user', async (t) => {
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

// Validation errors
test('POST /api/auth/login fails with missing identifier', async (t) => {
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

test('POST /api/auth/login fails with missing password', async (t) => {
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

test('POST /api/auth/login fails with empty identifier', async (t) => {
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

test('POST /api/auth/login fails with empty password', async (t) => {
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
