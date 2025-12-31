// Shelf CRUD and user operations tests
import test from 'ava';
import { setupTestServer, teardownTestServer } from './helpers/setup.js';

test.before(setupTestServer);
test.after.always(teardownTestServer);

// GET /api/shelves - List all shelves
test('GET /api/shelves returns all shelves', async (t) => {
    const { body } = await t.context.got('api/shelves');
    t.true(Array.isArray(body.data.shelves));
    t.true(body.success);
    t.true(body.data.shelves.length > 0);
});

test('GET /api/shelves includes shelf properties', async (t) => {
    const { body } = await t.context.got('api/shelves');
    const shelf = body.data.shelves[0];
    t.truthy(shelf.shelfId);
    t.truthy(shelf.name);
    t.truthy(shelf.userId);
    t.truthy(shelf.description);
    t.true(Array.isArray(shelf.works));
});

// GET /api/shelves/:shelfId - Get single shelf
test('GET /api/shelves/:shelfId returns shelf by ID', async (t) => {
    const { body } = await t.context.got('api/shelves/1');
    t.is(body.data.shelfId, 1);
    t.is(body.data.name, 'Drama Favorites');
    t.is(body.data.userId, 1);
    t.true(body.success);
});

test('GET /api/shelves/:shelfId returns another shelf by ID', async (t) => {
    const { body } = await t.context.got('api/shelves/3');
    t.is(body.data.shelfId, 3);
    t.is(body.data.name, 'Action Packed');
    t.is(body.data.userId, 2);
    t.true(body.success);
});

test('GET /api/shelves/:shelfId returns 404 for non-existent shelf', async (t) => {
    try {
        await t.context.got('api/shelves/999999');
    } catch (error) {
        t.is(error.response.statusCode, 404);
        t.regex(error.response.body.error, /shelf not found/i);
    }
});

test('GET /api/shelves/:shelfId returns 400 for invalid ID format', async (t) => {
    try {
        await t.context.got('api/shelves/invalid');
    } catch (error) {
        t.is(error.response.statusCode, 400);
    }
});

// PUT /api/shelves/:shelfId - Update shelf
test('PUT /api/shelves/:shelfId updates name', async (t) => {
    const updateData = { name: 'Updated Drama Collection' };
    const { body } = await t.context.got.put('api/shelves/1', { json: updateData });
    t.true(body.success);
    t.is(body.data.name, updateData.name);
});

test('PUT /api/shelves/:shelfId updates description', async (t) => {
    const updateData = { description: 'Updated description for my drama favorites' };
    const { body } = await t.context.got.put('api/shelves/1', { json: updateData });
    t.true(body.success);
    t.is(body.data.description, updateData.description);
});

test('PUT /api/shelves/:shelfId updates name and description', async (t) => {
    const updateData = { name: 'Complete Drama Collection', description: 'All my favorite dramatic works' };
    const { body } = await t.context.got.put('api/shelves/2', { json: updateData });
    t.true(body.success);
    t.is(body.data.name, updateData.name);
    t.is(body.data.description, updateData.description);
});

test('PUT /api/shelves/:shelfId returns 400 for empty name', async (t) => {
    try {
        await t.context.got.put('api/shelves/1', { json: { name: '   ' } });
    } catch (error) {
        t.is(error.response.statusCode, 400);
        t.regex(error.response.body.error, /cannot be empty/i);
    }
});

test('PUT /api/shelves/:shelfId returns 400 for no fields', async (t) => {
    try {
        await t.context.got.put('api/shelves/1', { json: {} });
    } catch (error) {
        t.is(error.response.statusCode, 400);
        t.regex(error.response.body.error, /at least one field/i);
    }
});

test('PUT /api/shelves/:shelfId returns 404 for non-existent shelf', async (t) => {
    try {
        await t.context.got.put('api/shelves/999999', { json: { name: 'Updated Name' } });
    } catch (error) {
        t.is(error.response.statusCode, 404);
        t.regex(error.response.body.error, /shelf not found/i);
    }
});

// DELETE /api/shelves/:shelfId - Delete shelf
test('DELETE /api/shelves/:shelfId deletes shelf', async (t) => {
    const newShelf = { name: 'Delete Me', description: 'This shelf will be deleted' };
    const { body: created } = await t.context.got.post('api/users/1/shelves', { json: newShelf });
    const shelfId = created.data.shelfId;

    const { statusCode } = await t.context.got.delete(`api/shelves/${shelfId}`);
    t.is(statusCode, 204);

    try {
        await t.context.got(`api/shelves/${shelfId}`);
    } catch (error) {
        t.is(error.response.statusCode, 404);
    }
});

test('DELETE /api/shelves/:shelfId returns 404 for non-existent shelf', async (t) => {
    try {
        await t.context.got.delete('api/shelves/999999');
    } catch (error) {
        t.is(error.response.statusCode, 404);
        t.regex(error.response.body.error, /shelf not found/i);
    }
});

// GET /api/users/:userId/shelves - List user's shelves
test("GET /api/users/:userId/shelves returns user's shelves", async (t) => {
    const { body } = await t.context.got('api/users/1/shelves');
    t.true(body.success);
    t.true(Array.isArray(body.data.shelves));
    t.true(body.data.shelves.length > 0);

    body.data.shelves.forEach(shelf => {
        t.is(shelf.userId, 1);
    });
});

test('GET /api/users/:userId/shelves returns empty for user with no shelves', async (t) => {
    const newUser = { username: 'noshelves', email: 'noshelves@example.com', password: 'password123' };
    const { body: created } = await t.context.got.post('api/users', { json: newUser });
    const userId = created.data.userId;

    const { body } = await t.context.got(`api/users/${userId}/shelves`);
    t.true(body.success);
    t.true(Array.isArray(body.data.shelves));
    t.is(body.data.shelves.length, 0);
});

test('GET /api/users/:userId/shelves returns empty for non-existent user (mock mode)', async (t) => {
    const { body } = await t.context.got('api/users/999999/shelves');
    t.true(body.success);
    t.true(Array.isArray(body.data.shelves));
    t.is(body.data.shelves.length, 0);
});

// POST /api/users/:userId/shelves - Create shelf
test('POST /api/users/:userId/shelves creates new shelf', async (t) => {
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

test('POST /api/users/:userId/shelves creates shelf without description', async (t) => {
    const newShelf = { name: 'Simple Collection' };
    const { body } = await t.context.got.post('api/users/2/shelves', { json: newShelf });

    t.true(body.success);
    t.is(body.data.name, newShelf.name);
    t.is(body.data.description, '');
    t.is(body.data.userId, 2);
});

test('POST /api/users/:userId/shelves trims whitespace', async (t) => {
    const newShelf = { name: '  Trimmed Collection  ', description: '  This should be trimmed  ' };
    const { body } = await t.context.got.post('api/users/3/shelves', { json: newShelf });

    t.true(body.success);
    t.is(body.data.name, 'Trimmed Collection');
    t.is(body.data.description, 'This should be trimmed');
});

test('POST /api/users/:userId/shelves returns 400 for missing name', async (t) => {
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

test('POST /api/users/:userId/shelves returns 400 for empty name', async (t) => {
    const newShelf = { name: '   ', description: 'Collection with empty name' };

    try {
        await t.context.got.post('api/users/1/shelves', { json: newShelf });
    } catch (error) {
        t.is(error.response.statusCode, 400);
        t.regex(error.response.body.error, /name is required/i);
    }
});
