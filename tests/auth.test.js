import test from 'ava';
import got from 'got';
import listen from 'test-listen';
import http from 'http';
import app from '../app.js';

test.before(async (t) => {
    t.context.server = http.createServer(app);
    t.context.prefixUrl = await listen(t.context.server);
    t.context.got = got.extend({ prefixUrl: t.context.prefixUrl, responseType: 'json' });
});

test.after.always((t) => {
    t.context.server.close();
});

// POST /api/auth/signup
test('POST /api/auth/signup creates a new user (Happy Path 1)', async (t) => {
    const newUser = {
        username: 'signupuser',
        email: 'signup@example.com',
        password: 'password123',
        profilePictureUrl: 'http://example.com/pic.jpg'
    };

    const { body } = await t.context.got.post('api/auth/signup', { json: newUser });

    t.true(body.success);
    t.is(body.data.username, newUser.username);
    t.is(body.data.email, newUser.email);
    t.is(body.data.profilePictureUrl, newUser.profilePictureUrl);
});

test('POST /api/auth/signup creates user with minimal fields (Happy Path 2)', async (t) => {
    const newUser = {
        username: 'minimaluser',
        email: 'minimal@example.com',
        password: 'password123'
    };

    const { body } = await t.context.got.post('api/auth/signup', { json: newUser });

    t.true(body.success);
    t.is(body.data.username, newUser.username);
    // Should have default profile pic
    t.truthy(body.data.profilePictureUrl);
});

test('POST /api/auth/signup fails with missing email (Unhappy Path 1)', async (t) => {
    const invalidUser = {
        username: 'noemail',
        password: 'password123'
    };

    try {
        await t.context.got.post('api/auth/signup', { json: invalidUser });
    } catch (error) {
        t.is(error.response.statusCode, 400);
        t.true(error.response.body.error.includes('email is required'));
    }
});

test('POST /api/auth/signup fails with invalid email format (Unhappy Path 2)', async (t) => {
    const invalidUser = {
        username: 'bademail',
        email: 'notanemail',
        password: 'password123'
    };

    try {
        await t.context.got.post('api/auth/signup', { json: invalidUser });
    } catch (error) {
        t.is(error.response.statusCode, 400);
        t.regex(error.response.body.error, /Invalid email format/);
    }
});

test('POST /api/auth/signup fails with weak password (Unhappy Path 3)', async (t) => {
    const invalidUser = {
        username: 'weakpw',
        email: 'weakpw@example.com',
        password: '123'
    };

    try {
        await t.context.got.post('api/auth/signup', { json: invalidUser });
    } catch (error) {
        t.is(error.response.statusCode, 400);
        // Assuming validation error for short password
        t.true(error.response.body.error.some(e => e.includes('at least 6 characters')));
    }
});

test('POST /api/auth/signup fails if username exists (Unhappy Path 4)', async (t) => {
    // Create first user
    const user1 = {
        username: 'duplicateuser',
        email: 'user1@example.com',
        password: 'password123'
    };
    await t.context.got.post('api/auth/signup', { json: user1 });

    // Try to create second user with same username
    const user2 = {
        username: 'duplicateuser',
        email: 'user2@example.com',
        password: 'password123'
    };

    try {
        await t.context.got.post('api/auth/signup', { json: user2 });
    } catch (error) {
        t.is(error.response.statusCode, 400);
        t.regex(error.response.body.error, /Username already exists/);
    }
});

test('POST /api/auth/signup fails if email exists (Unhappy Path 5)', async (t) => {
    // Create first user
    const user1 = {
        username: 'uniqueuser1',
        email: 'duplicate@example.com',
        password: 'password123'
    };
    await t.context.got.post('api/auth/signup', { json: user1 });

    // Try to create second user with same email
    const user2 = {
        username: 'uniqueuser2',
        email: 'duplicate@example.com',
        password: 'password123'
    };

    try {
        await t.context.got.post('api/auth/signup', { json: user2 });
    } catch (error) {
        t.is(error.response.statusCode, 400);
        t.regex(error.response.body.error, /Email already exists/);
    }
});

// POST /api/auth/login
test('POST /api/auth/login logs in with username (Happy Path 1)', async (t) => {
    // Signup first
    const user = {
        username: 'loginuser1',
        email: 'login1@example.com',
        password: 'password123'
    };
    await t.context.got.post('api/auth/signup', { json: user });

    // Login
    const { body } = await t.context.got.post('api/auth/login', {
        json: {
            identifier: user.username,
            password: user.password
        }
    });

    t.true(body.success);
    t.is(body.data.username, user.username);
});

test('POST /api/auth/login logs in with email (Happy Path 2)', async (t) => {
    // Signup first
    const user = {
        username: 'loginuser2',
        email: 'login2@example.com',
        password: 'password123'
    };
    await t.context.got.post('api/auth/signup', { json: user });

    // Login
    const { body } = await t.context.got.post('api/auth/login', {
        json: {
            identifier: user.email,
            password: user.password
        }
    });

    t.true(body.success);
    t.is(body.data.email, user.email);
});

test('POST /api/auth/login fails with missing fields (Unhappy Path 1)', async (t) => {
    try {
        await t.context.got.post('api/auth/login', {
            json: { identifier: 'someuser' } // missing password
        });
    } catch (error) {
        t.is(error.response.statusCode, 400);
        t.true(error.response.body.error.includes('identifier and password are required'));
    }
});

test('POST /api/auth/login fails for non-existent user (Unhappy Path 2)', async (t) => {
    try {
        await t.context.got.post('api/auth/login', {
            json: {
                identifier: 'nonexistent',
                password: 'password123'
            }
        });
    } catch (error) {
        t.is(error.response.statusCode, 401);
        t.regex(error.response.body.error, /User not found/);
    }
});

test('POST /api/auth/login fails with incorrect password (Unhappy Path 3)', async (t) => {
    // Signup first
    const user = {
        username: 'wrongpwuser',
        email: 'wrongpw@example.com',
        password: 'password123'
    };
    await t.context.got.post('api/auth/signup', { json: user });

    try {
        await t.context.got.post('api/auth/login', {
            json: {
                identifier: user.username,
                password: 'wrongpassword'
            }
        });
    } catch (error) {
        t.is(error.response.statusCode, 401);
        t.regex(error.response.body.error, /Invalid credentials/);
    }
});
