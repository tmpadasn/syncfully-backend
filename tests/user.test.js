// User CRUD operations tests
import test from 'ava';
import { setupTestServer, teardownTestServer } from './helpers/setup.js';

test.before(setupTestServer);
test.after.always(teardownTestServer);

// POST /api/users - Create user
test('POST /api/users creates new user', async (t) => {
    const newUser = { username: 'testuser', email: 'test@example.com', password: 'password123' };
    const { body } = await t.context.got.post('api/users', { json: newUser });

    t.true(body.success);
    t.is(body.data.username, newUser.username);
    t.is(body.data.email, newUser.email);
    t.truthy(body.data.userId);
    t.falsy(body.data.password);
});

test('POST /api/users creates user with profile picture', async (t) => {
    const newUser = {
        username: 'pictureuser', email: 'picture@example.com',
        password: 'password123', profilePictureUrl: 'http://example.com/pic.jpg'
    };
    const { body } = await t.context.got.post('api/users', { json: newUser });

    t.true(body.success);
    t.is(body.data.profilePictureUrl, newUser.profilePictureUrl);
});

test('POST /api/users returns 400 for missing username', async (t) => {
    try {
        await t.context.got.post('api/users', { json: { email: 'test@example.com', password: 'password123' } });
    } catch (error) {
        t.is(error.response.statusCode, 400);
    }
});

test('POST /api/users returns 400 for missing email', async (t) => {
    try {
        await t.context.got.post('api/users', { json: { username: 'testuser', password: 'password123' } });
    } catch (error) {
        t.is(error.response.statusCode, 400);
    }
});

test('POST /api/users returns 400 for missing password', async (t) => {
    try {
        await t.context.got.post('api/users', { json: { username: 'testuser', email: 'test@example.com' } });
    } catch (error) {
        t.is(error.response.statusCode, 400);
    }
});

test('POST /api/users returns 400 for duplicate username', async (t) => {
    try {
        await t.context.got.post('api/users', { json: { username: 'alice', email: 'newalice@example.com', password: 'password123' } });
    } catch (error) {
        t.is(error.response.statusCode, 400);
    }
});

test('POST /api/users returns 400 for duplicate email', async (t) => {
    try {
        await t.context.got.post('api/users', { json: { username: 'newalice', email: 'alice@example.com', password: 'password123' } });
    } catch (error) {
        t.is(error.response.statusCode, 400);
    }
});

// GET /api/users - List all users
test('GET /api/users returns all users', async (t) => {
    const { body } = await t.context.got('api/users');
    t.true(Array.isArray(body.data));
    t.true(body.success);
    t.true(body.data.length > 0);
});

test('GET /api/users includes user properties', async (t) => {
    const { body } = await t.context.got('api/users');
    const user = body.data[0];
    t.truthy(user.userId);
    t.truthy(user.username);
    t.truthy(user.email);
});

// GET /api/users/:userId - Get user by ID
test('GET /api/users/:userId returns user by ID', async (t) => {
    const { body } = await t.context.got('api/users/1');
    t.is(body.data.userId, 1);
    t.is(body.data.username, 'alice');
    t.true(body.success);
});

test('GET /api/users/:userId returns another user by ID', async (t) => {
    const { body } = await t.context.got('api/users/2');
    t.is(body.data.userId, 2);
    t.is(body.data.username, 'bob');
    t.true(body.success);
});

test('GET /api/users/:userId returns 404 for non-existent user', async (t) => {
    try {
        await t.context.got('api/users/999999');
    } catch (error) {
        t.is(error.response.statusCode, 404);
    }
});

test('GET /api/users/:userId returns 400 for invalid ID format', async (t) => {
    try {
        await t.context.got('api/users/invalid');
    } catch (error) {
        t.is(error.response.statusCode, 400);
    }
});

// PUT /api/users/:userId - Update user
test('PUT /api/users/:userId updates username', async (t) => {
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

test('PUT /api/users/:userId updates multiple fields', async (t) => {
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

test('PUT /api/users/:userId returns 404 for non-existent user', async (t) => {
    const updateData = { username: 'newname' };

    try {
        await t.context.got.put('api/users/999999', { json: updateData });
    } catch (error) {
        t.is(error.response.statusCode, 404);
    }
});

test('PUT /api/users/:userId returns 400 for duplicate username', async (t) => {
    const newUser = {
        username: 'conflictuser',
        email: 'conflict@example.com',
        password: 'password123'
    };
    const { body: created } = await t.context.got.post('api/users', { json: newUser });
    const userId = created.data.userId;

    const updateData = { username: 'alice' };

    try {
        await t.context.got.put(`api/users/${userId}`, { json: updateData });
    } catch (error) {
        t.is(error.response.statusCode, 400);
    }
});

// DELETE /api/users/:userId - Delete user
test('DELETE /api/users/:userId deletes user', async (t) => {
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

test('DELETE /api/users/:userId returns 404 for non-existent user', async (t) => {
    try {
        await t.context.got.delete('api/users/999999');
    } catch (error) {
        t.is(error.response.statusCode, 404);
    }
});
