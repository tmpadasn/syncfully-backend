// Shelf works operations tests
import test from 'ava';
import { setupTestServer, teardownTestServer } from './helpers/setup.js';

test.before(setupTestServer);
test.after.always(teardownTestServer);

// POST /api/shelves/:shelfId/works/:workId - Add work to shelf
test('POST /api/shelves/:shelfId/works/:workId adds work to shelf', async (t) => {
    const newShelf = { name: 'Test Add Work', description: 'Testing adding works' };
    const { body: created } = await t.context.got.post('api/users/1/shelves', { json: newShelf });
    const shelfId = created.data.shelfId;

    const { body } = await t.context.got.post(`api/shelves/${shelfId}/works/5`);
    t.true(body.success);
    t.true(body.data.works.includes(5));
});

test('POST /api/shelves/:shelfId/works/:workId adds multiple works', async (t) => {
    const newShelf = { name: 'Test Multiple Works', description: 'Testing multiple works' };
    const { body: created } = await t.context.got.post('api/users/1/shelves', { json: newShelf });
    const shelfId = created.data.shelfId;

    await t.context.got.post(`api/shelves/${shelfId}/works/10`);
    const { body } = await t.context.got.post(`api/shelves/${shelfId}/works/15`);

    t.true(body.success);
    t.true(body.data.works.includes(10));
    t.true(body.data.works.includes(15));
    t.is(body.data.works.length, 2);
});

test('POST /api/shelves/:shelfId/works/:workId prevents duplicate works', async (t) => {
    const { body } = await t.context.got.post('api/shelves/1/works/1');
    t.true(body.success);
    const workCount = body.data.works.filter(id => id === 1).length;
    t.is(workCount, 1);
});

test('POST /api/shelves/:shelfId/works/:workId returns 404 for non-existent shelf', async (t) => {
    try {
        await t.context.got.post('api/shelves/999999/works/1');
    } catch (error) {
        t.is(error.response.statusCode, 404);
        t.regex(error.response.body.error, /shelf not found/i);
    }
});

test('POST /api/shelves/:shelfId/works/:workId accepts invalid work ID in mock mode', async (t) => {
    const { body } = await t.context.got.post('api/shelves/1/works/999999');
    t.true(body.success);
});

// GET /api/shelves/:shelfId/works - List works in shelf
test('GET /api/shelves/:shelfId/works returns works in shelf', async (t) => {
    const { body } = await t.context.got('api/shelves/1/works');
    t.true(body.success);
    t.true(Array.isArray(body.data.works));
    t.true(body.data.works.length > 0);
});

test('GET /api/shelves/:shelfId/works returns empty for shelf with no works', async (t) => {
    const newShelf = { name: 'Empty Shelf', description: 'No works here' };
    const { body: created } = await t.context.got.post('api/users/1/shelves', { json: newShelf });
    const shelfId = created.data.shelfId;

    const { body } = await t.context.got(`api/shelves/${shelfId}/works`);
    t.true(body.success);
    t.true(Array.isArray(body.data.works));
    t.is(body.data.works.length, 0);
});

test('GET /api/shelves/:shelfId/works returns 404 for non-existent shelf', async (t) => {
    try {
        await t.context.got('api/shelves/999999/works');
    } catch (error) {
        t.is(error.response.statusCode, 404);
        t.regex(error.response.body.error, /shelf not found/i);
    }
});

test('GET /api/shelves/:shelfId/works filters by work-type', async (t) => {
    const { body } = await t.context.got('api/shelves/1/works?work-type=movie');
    t.true(body.success);
    t.true(Array.isArray(body.data.works));
});

test('GET /api/shelves/:shelfId/works filters by genre', async (t) => {
    const { body } = await t.context.got('api/shelves/3/works?genre=Action');
    t.true(body.success);
    t.true(Array.isArray(body.data.works));
});

test('GET /api/shelves/:shelfId/works filters by rating', async (t) => {
    const { body } = await t.context.got('api/shelves/1/works?rating=4.0');
    t.true(body.success);
    t.true(Array.isArray(body.data.works));
});

test('GET /api/shelves/:shelfId/works filters by year', async (t) => {
    const { body } = await t.context.got('api/shelves/1/works?year=2020');
    t.true(body.success);
    t.true(Array.isArray(body.data.works));
});

test('GET /api/shelves/:shelfId/works combines multiple filters', async (t) => {
    const { body } = await t.context.got('api/shelves/3/works?work-type=movie&genre=Action&rating=4.0');
    t.true(body.success);
    t.true(Array.isArray(body.data.works));
});

test('GET /api/shelves/:shelfId/works handles invalid filters', async (t) => {
    const { body } = await t.context.got('api/shelves/1/works?work-type=invalid&rating=invalid');
    t.true(body.success);
    t.true(Array.isArray(body.data.works));
});

// DELETE /api/shelves/:shelfId/works/:workId - Remove work from shelf
test('DELETE /api/shelves/:shelfId/works/:workId removes work from shelf', async (t) => {
    const newShelf = { name: 'Test Remove Work', description: 'Testing removing works' };
    const { body: created } = await t.context.got.post('api/users/1/shelves', { json: newShelf });
    const shelfId = created.data.shelfId;

    await t.context.got.post(`api/shelves/${shelfId}/works/20`);
    const { body } = await t.context.got.delete(`api/shelves/${shelfId}/works/20`);
    t.true(body.success);
    t.false(body.data.works.includes(20));
});

test('DELETE /api/shelves/:shelfId/works/:workId removes only specified work', async (t) => {
    const newShelf = { name: 'Test Selective Remove', description: 'Testing selective work removal' };
    const { body: created } = await t.context.got.post('api/users/1/shelves', { json: newShelf });
    const shelfId = created.data.shelfId;

    await t.context.got.post(`api/shelves/${shelfId}/works/25`);
    await t.context.got.post(`api/shelves/${shelfId}/works/30`);
    await t.context.got.post(`api/shelves/${shelfId}/works/35`);

    const { body } = await t.context.got.delete(`api/shelves/${shelfId}/works/30`);
    t.true(body.success);
    t.true(body.data.works.includes(25));
    t.false(body.data.works.includes(30));
    t.true(body.data.works.includes(35));
    t.is(body.data.works.length, 2);
});

test('DELETE /api/shelves/:shelfId/works/:workId handles work not in shelf', async (t) => {
    const { body } = await t.context.got.delete('api/shelves/1/works/999');
    t.true(body.success);
});

test('DELETE /api/shelves/:shelfId/works/:workId returns 404 for non-existent shelf', async (t) => {
    try {
        await t.context.got.delete('api/shelves/999999/works/1');
    } catch (error) {
        t.is(error.response.statusCode, 404);
        t.regex(error.response.body.error, /shelf not found/i);
    }
});

// Integration test - complex shelf workflow
test('Integration - complex shelf operations work together', async (t) => {
    const newUser = { username: 'complexuser', email: 'complex@example.com', password: 'password123' };
    const { body: userCreated } = await t.context.got.post('api/users', { json: newUser });
    const userId = userCreated.data.userId;

    const newShelf = { name: 'Complex Operations', description: 'Testing complex shelf operations' };
    const { body: shelfCreated } = await t.context.got.post(`api/users/${userId}/shelves`, { json: newShelf });
    const shelfId = shelfCreated.data.shelfId;

    await t.context.got.post(`api/shelves/${shelfId}/works/1`);
    await t.context.got.post(`api/shelves/${shelfId}/works/2`);
    await t.context.got.post(`api/shelves/${shelfId}/works/3`);

    const { body: works } = await t.context.got(`api/shelves/${shelfId}/works`);
    t.is(works.data.works.length, 3);

    const updateData = { name: 'Updated Complex Operations' };
    const { body: updated } = await t.context.got.put(`api/shelves/${shelfId}`, { json: updateData });
    t.is(updated.data.name, updateData.name);

    await t.context.got.delete(`api/shelves/${shelfId}/works/2`);
    const { body: afterRemove } = await t.context.got(`api/shelves/${shelfId}/works`);
    t.is(afterRemove.data.works.length, 2);
    t.false(afterRemove.data.works.includes(2));

    const { body: userShelves } = await t.context.got(`api/users/${userId}/shelves`);
    t.true(userShelves.data.shelves.some(s => s.shelfId === shelfId));
});
