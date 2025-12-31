// Work tests
import test from 'ava';
import { setupTestServer, teardownTestServer } from './helpers/setup.js';

test.before(setupTestServer);
test.after.always(teardownTestServer);

// POST /api/works - Create work
test('POST /api/works creates new work', async (t) => {
    const newWork = { title: 'Test Work', type: 'movie', year: 2023, genres: ['Action'] };
    const { body } = await t.context.got.post('api/works', { json: newWork });

    t.true(body.success);
    t.is(body.data.title, newWork.title);
    t.truthy(body.data.workId);
});

test('POST /api/works creates with minimal fields', async (t) => {
    const newWork = { title: 'Minimal Work', type: 'book' };
    const { body } = await t.context.got.post('api/works', { json: newWork });

    t.true(body.success);
    t.is(body.data.title, newWork.title);
    t.truthy(body.data.workId);
});

test('POST /api/works returns 400 for missing fields', async (t) => {
    try {
        await t.context.got.post('api/works', { json: { year: 2023 } });
    } catch (error) {
        t.is(error.response.statusCode, 400);
    }
});

// GET /api/works - List works
test('GET /api/works returns all works', async (t) => {
    const { body } = await t.context.got('api/works');
    t.true(Array.isArray(body.data.works));
    t.true(body.success);
});

test('GET /api/works filters by type', async (t) => {
    const { body } = await t.context.got('api/works?type=movie');
    t.true(Array.isArray(body.data.works));
    t.true(body.success);
    body.data.works.forEach(work => {
        t.is(work.type, 'movie');
    });
});

test('GET /api/works ignores invalid filter', async (t) => {
    const { body } = await t.context.got('api/works?invalidparam=something');
    t.true(Array.isArray(body.data.works));
    t.true(body.success);
});

// GET /api/works/:workId - Get work by ID
test('GET /api/works/:workId returns work by ID', async (t) => {
    const { body } = await t.context.got('api/works/1');
    t.is(body.data.workId, 1);
    t.true(body.success);
});

test('GET /api/works/:workId returns another work', async (t) => {
    const { body } = await t.context.got('api/works/2');
    t.is(body.data.workId, 2);
    t.true(body.success);
});

test('GET /api/works/:workId returns 404 for non-existent work', async (t) => {
    try {
        await t.context.got('api/works/999999');
    } catch (error) {
        t.is(error.response.statusCode, 404);
    }
});

// PUT /api/works/:workId - Update work
test('PUT /api/works/:workId updates work', async (t) => {
    const newWork = { title: 'Work to Update', type: 'book' };
    const { body: created } = await t.context.got.post('api/works', { json: newWork });
    const workId = created.data.workId;

    const updateData = { title: 'Updated Work Title' };
    const { body: updated } = await t.context.got.put(`api/works/${workId}`, { json: updateData });
    t.true(updated.success);
    t.is(updated.data.title, updateData.title);
});

test('PUT /api/works/:workId updates multiple fields', async (t) => {
    const newWork = { title: 'Multi Update', type: 'music', year: 2000 };
    const { body: created } = await t.context.got.post('api/works', { json: newWork });
    const workId = created.data.workId;

    const updateData = { title: 'Updated Multi', year: 2001 };
    const { body: updated } = await t.context.got.put(`api/works/${workId}`, { json: updateData });
    t.true(updated.success);
    t.is(updated.data.title, updateData.title);
    t.is(updated.data.year, updateData.year);
});

test('PUT /api/works/:workId returns 404 for non-existent work', async (t) => {
    try {
        await t.context.got.put('api/works/999999', { json: { title: 'Updated Work Title' } });
    } catch (error) {
        t.is(error.response.statusCode, 404);
    }
});

// DELETE /api/works/:workId - Delete work
test('DELETE /api/works/:workId deletes work', async (t) => {
    const newWork = { title: 'Work to Delete', type: 'music' };
    const { body: created } = await t.context.got.post('api/works', { json: newWork });
    const workId = created.data.workId;

    const { statusCode } = await t.context.got.delete(`api/works/${workId}`);
    t.is(statusCode, 204);

    try {
        await t.context.got(`api/works/${workId}`);
    } catch (error) {
        t.is(error.response.statusCode, 404);
    }
});

test('DELETE /api/works/:workId deletes another work', async (t) => {
    const newWork = { title: 'Another Delete', type: 'movie' };
    const { body: created } = await t.context.got.post('api/works', { json: newWork });
    const workId = created.data.workId;

    const { statusCode } = await t.context.got.delete(`api/works/${workId}`);
    t.is(statusCode, 204);
});

test('DELETE /api/works/:workId returns 404 for non-existent work', async (t) => {
    try {
        await t.context.got.delete('api/works/999999');
    } catch (error) {
        t.is(error.response.statusCode, 404);
    }
});

// GET /api/works/popular - Get popular works
test('GET /api/works/popular returns popular works', async (t) => {
    const { body } = await t.context.got('api/works/popular');
    t.true(Array.isArray(body.data.works));
    t.true(body.success);
});

test('GET /api/works/popular respects limit', async (t) => {
    const { body } = await t.context.got('api/works/popular');
    t.true(body.data.works.length <= 10);
    t.true(body.success);
});

// GET /api/works/:workId/similar - Get similar works
test('GET /api/works/:workId/similar returns similar works', async (t) => {
    const { body } = await t.context.got('api/works/1/similar');
    t.true(Array.isArray(body.data.works));
    t.true(body.success);
});

test('GET /api/works/:workId/similar works for music', async (t) => {
    const { body } = await t.context.got('api/works/4/similar');
    t.true(Array.isArray(body.data.works));
    t.true(body.success);
});

test('GET /api/works/:workId/similar returns 404 for non-existent work', async (t) => {
    try {
        await t.context.got('api/works/999999/similar');
    } catch (error) {
        t.is(error.response.statusCode, 404);
    }
});
