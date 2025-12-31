// Ratings tests
import test from 'ava';
import { setupTestServer, teardownTestServer } from './helpers/setup.js';

test.before(setupTestServer);
test.after.always(teardownTestServer);

// GET /api/ratings - List all ratings
test('GET /api/ratings returns all ratings', async (t) => {
    const { body } = await t.context.got('api/ratings');
    t.true(Array.isArray(body.data.ratings));
    t.true(body.success);
});

// GET /api/ratings/:ratingId - Get rating by ID
test('GET /api/ratings/:ratingId returns rating by ID', async (t) => {
    const { body: all } = await t.context.got('api/ratings');
    const ratingId = all.data.ratings[0].ratingId;

    const { body } = await t.context.got(`api/ratings/${ratingId}`);
    t.is(body.data.ratingId, ratingId);
    t.true(body.success);
});

test('GET /api/ratings/:ratingId returns 404 for non-existent rating', async (t) => {
    try {
        await t.context.got('api/ratings/999999');
    } catch (error) {
        t.is(error.response.statusCode, 404);
    }
});

// PUT /api/ratings/:ratingId - Update rating
test('PUT /api/ratings/:ratingId updates rating', async (t) => {
    const { body: all } = await t.context.got('api/ratings');
    const ratingId = all.data.ratings[0].ratingId;

    const updateData = { score: 1 };
    const { body } = await t.context.got.put(`api/ratings/${ratingId}`, { json: updateData });

    t.true(body.success);
    t.is(body.data.score, 1);
});

test('PUT /api/ratings/:ratingId returns 404 for non-existent rating', async (t) => {
    try {
        await t.context.got.put('api/ratings/999999', { json: { score: 5 } });
    } catch (error) {
        t.is(error.response.statusCode, 404);
    }
});

// DELETE /api/ratings/:ratingId - Delete rating
test('DELETE /api/ratings/:ratingId deletes rating', async (t) => {
    const { body: created } = await t.context.got.post('api/works/1/ratings', {
        json: { userId: 2, score: 4 }
    });
    const ratingId = created.data.ratingId;

    const { statusCode } = await t.context.got.delete(`api/ratings/${ratingId}`);
    t.is(statusCode, 204);

    try {
        await t.context.got(`api/ratings/${ratingId}`);
    } catch (error) {
        t.is(error.response.statusCode, 404);
    }
});

test('DELETE /api/ratings/:ratingId returns 404 for non-existent rating', async (t) => {
    try {
        await t.context.got.delete('api/ratings/999999');
    } catch (error) {
        t.is(error.response.statusCode, 404);
    }
});

// GET /api/works/:workId/ratings/average - Get average rating
test('GET /api/works/:workId/ratings/average returns average', async (t) => {
    const { body } = await t.context.got('api/works/1/ratings/average');
    t.true(body.success);
    t.truthy(body.data.averageRating !== undefined);
    t.truthy(body.data.totalRatings !== undefined);
});

test('GET /api/works/:workId/ratings/average returns 0 for no ratings', async (t) => {
    const newWork = { title: 'No Ratings Avg', type: 'movie' };
    const { body: created } = await t.context.got.post('api/works', { json: newWork });
    const workId = created.data.workId;

    const { body } = await t.context.got(`api/works/${workId}/ratings/average`);
    t.true(body.success);
    t.is(body.data.averageRating, 0);
    t.is(body.data.totalRatings, 0);
});

test('GET /api/works/:workId/ratings/average returns 400 for invalid ID', async (t) => {
    try {
        await t.context.got('api/works/invalid/ratings/average');
    } catch (error) {
        t.is(error.response.statusCode, 400);
    }
});

// GET /api/works/:workId/ratings - List work's ratings
test('GET /api/works/:workId/ratings returns ratings', async (t) => {
    const { body } = await t.context.got('api/works/1/ratings');
    t.true(Array.isArray(body.data.ratings));
    t.true(body.success);
});

test('GET /api/works/:workId/ratings returns empty for work with no ratings', async (t) => {
    const newWork = { title: 'No Ratings', type: 'book' };
    const { body: created } = await t.context.got.post('api/works', { json: newWork });
    const workId = created.data.workId;

    const { body } = await t.context.got(`api/works/${workId}/ratings`);
    t.true(Array.isArray(body.data.ratings));
    t.is(body.data.ratings.length, 0);
    t.true(body.success);
});

test('GET /api/works/:workId/ratings returns 400 for invalid ID', async (t) => {
    try {
        await t.context.got('api/works/invalid/ratings');
    } catch (error) {
        t.is(error.response.statusCode, 400);
    }
});

// POST /api/works/:workId/ratings - Submit rating
test('POST /api/works/:workId/ratings submits rating', async (t) => {
    const ratingData = { userId: 1, score: 5 };
    const { body } = await t.context.got.post('api/works/1/ratings', { json: ratingData });
    t.true(body.success);
    t.is(body.data.score, ratingData.score);
    t.is(body.data.userId, ratingData.userId);
});

test('POST /api/works/:workId/ratings updates existing rating', async (t) => {
    const ratingData = { userId: 1, score: 3 };
    const { body } = await t.context.got.post('api/works/1/ratings', { json: ratingData });
    t.true(body.success);
    t.is(body.data.score, ratingData.score);

    const { body: ratings } = await t.context.got('api/works/1/ratings');
    const userRating = ratings.data.ratings.find(r => r.userId === 1);
    t.is(userRating.score, 3);
});

test('POST /api/works/:workId/ratings returns 400 for invalid score', async (t) => {
    try {
        await t.context.got.post('api/works/1/ratings', { json: { userId: 1, score: 6 } });
    } catch (error) {
        t.is(error.response.statusCode, 400);
    }
});

test('POST /api/works/:workId/ratings returns 404 for non-existent work', async (t) => {
    try {
        await t.context.got.post('api/works/999999/ratings', { json: { userId: 1, score: 5 } });
    } catch (error) {
        t.is(error.response.statusCode, 404);
    }
});
