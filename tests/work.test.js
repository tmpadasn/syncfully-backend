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

// GET /api/works
test('GET /api/works returns all works (Happy Path 1)', async (t) => {
    const { body } = await t.context.got('api/works');
    t.true(Array.isArray(body.data.works));
    t.true(body.success);
});

test('GET /api/works filters by type (Happy Path 2)', async (t) => {
    const { body } = await t.context.got('api/works?type=movie');
    t.true(Array.isArray(body.data.works));
    t.true(body.success);
    // Verify all returned works are movies
    body.data.works.forEach(work => {
        t.is(work.type, 'movie');
    });
});

test('GET /api/works handles invalid filter gracefully (Unhappy Path 1)', async (t) => {
    // Should ignore invalid filter and return works
    const { body } = await t.context.got('api/works?invalidparam=something');
    t.true(Array.isArray(body.data.works));
    t.true(body.success);
});

// GET /api/works/popular
test('GET /api/works/popular returns popular works (Happy Path 1)', async (t) => {
    const { body } = await t.context.got('api/works/popular');
    t.true(Array.isArray(body.data.works));
    t.true(body.success);
});

test('GET /api/works/popular respects limit implicitly (Happy Path 2)', async (t) => {
    const { body } = await t.context.got('api/works/popular');
    t.true(body.data.works.length <= 10); // Assuming default limit is 10 or less
    t.true(body.success);
});

// GET /api/works/:workId
test('GET /api/works/:workId returns a specific work (Happy Path 1)', async (t) => {
    // Assuming mock data has a work with ID 1
    const { body } = await t.context.got('api/works/1');
    t.is(body.data.workId, 1);
    t.true(body.success);
});

test('GET /api/works/:workId returns another specific work (Happy Path 2)', async (t) => {
    // Assuming mock data has a work with ID 2
    const { body } = await t.context.got('api/works/2');
    t.is(body.data.workId, 2);
    t.true(body.success);
});

test('GET /api/works/:workId returns 404 for non-existent work (Unhappy Path 1)', async (t) => {
    try {
        await t.context.got('api/works/999999');
    } catch (error) {
        t.is(error.response.statusCode, 404);
    }
});

// POST /api/works
test('POST /api/works creates a new work (Happy Path 1)', async (t) => {
    const newWork = {
        title: 'Test Work',
        type: 'movie',
        year: 2023,
        genres: ['Action']
    };

    const { body } = await t.context.got.post('api/works', {
        json: newWork
    });

    t.true(body.success);
    t.is(body.data.title, newWork.title);
    t.truthy(body.data.workId);
});

test('POST /api/works creates a new work with minimal fields (Happy Path 2)', async (t) => {
    const newWork = {
        title: 'Minimal Work',
        type: 'book'
    };

    const { body } = await t.context.got.post('api/works', {
        json: newWork
    });

    t.true(body.success);
    t.is(body.data.title, newWork.title);
    t.truthy(body.data.workId);
});

test('POST /api/works fails with missing required fields (Unhappy Path 1)', async (t) => {
    const invalidWork = {
        year: 2023
        // Missing title and type
    };

    try {
        await t.context.got.post('api/works', {
            json: invalidWork
        });
    } catch (error) {
        t.is(error.response.statusCode, 400);
    }
});

// PUT /api/works/:workId
test('PUT /api/works/:workId updates a work (Happy Path 1)', async (t) => {
    // First create a work to update
    const newWork = {
        title: 'Work to Update',
        type: 'book'
    };
    const { body: created } = await t.context.got.post('api/works', { json: newWork });
    const workId = created.data.workId;

    const updateData = {
        title: 'Updated Work Title'
    };

    const { body: updated } = await t.context.got.put(`api/works/${workId}`, {
        json: updateData
    });

    t.true(updated.success);
    t.is(updated.data.title, updateData.title);
});

test('PUT /api/works/:workId updates multiple fields (Happy Path 2)', async (t) => {
    // First create a work to update
    const newWork = {
        title: 'Multi Update',
        type: 'music',
        year: 2000
    };
    const { body: created } = await t.context.got.post('api/works', { json: newWork });
    const workId = created.data.workId;

    const updateData = {
        title: 'Updated Multi',
        year: 2001
    };

    const { body: updated } = await t.context.got.put(`api/works/${workId}`, {
        json: updateData
    });

    t.true(updated.success);
    t.is(updated.data.title, updateData.title);
    t.is(updated.data.year, updateData.year);
});

test('PUT /api/works/:workId returns 404 for non-existent work (Unhappy Path 1)', async (t) => {
    const updateData = {
        title: 'Updated Work Title'
    };

    try {
        await t.context.got.put('api/works/999999', {
            json: updateData
        });
    } catch (error) {
        t.is(error.response.statusCode, 404);
    }
});

// DELETE /api/works/:workId
test('DELETE /api/works/:workId deletes a work (Happy Path 1)', async (t) => {
    // First create a work to delete
    const newWork = {
        title: 'Work to Delete',
        type: 'music'
    };
    const { body: created } = await t.context.got.post('api/works', { json: newWork });
    const workId = created.data.workId;

    const { statusCode } = await t.context.got.delete(`api/works/${workId}`);
    t.is(statusCode, 204);

    // Verify it's gone
    try {
        await t.context.got(`api/works/${workId}`);
    } catch (error) {
        t.is(error.response.statusCode, 404);
    }
});

test('DELETE /api/works/:workId deletes another work (Happy Path 2)', async (t) => {
    // First create a work to delete
    const newWork = {
        title: 'Another Delete',
        type: 'movie'
    };
    const { body: created } = await t.context.got.post('api/works', { json: newWork });
    const workId = created.data.workId;

    const { statusCode } = await t.context.got.delete(`api/works/${workId}`);
    t.is(statusCode, 204);
});

test('DELETE /api/works/:workId returns 404 for non-existent work (Unhappy Path 1)', async (t) => {
    try {
        await t.context.got.delete('api/works/999999');
    } catch (error) {
        t.is(error.response.statusCode, 404);
    }
});

// GET /api/works/:workId/similar
test('GET /api/works/:workId/similar returns similar works (Happy Path 1)', async (t) => {
    // Assuming mock data has a work with ID 1
    const { body } = await t.context.got('api/works/1/similar');
    t.true(Array.isArray(body.data.works));
    t.true(body.success);
});

test('GET /api/works/:workId/similar returns similar works for another type (Happy Path 2)', async (t) => {
    // Assuming mock data has a work with ID 4 (Music)
    const { body } = await t.context.got('api/works/4/similar');
    t.true(Array.isArray(body.data.works));
    t.true(body.success);
});

test('GET /api/works/:workId/similar returns 404 for non-existent work (Unhappy Path 1)', async (t) => {
    try {
        await t.context.got('api/works/999999/similar');
    } catch (error) {
        t.is(error.response.statusCode, 404);
    }
});

