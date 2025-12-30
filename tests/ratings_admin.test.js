/**
 * ============================================================
 * ADMIN RATINGS TESTS
 * ============================================================
 * Tests for admin rating management operations.
 * 
 * This file covers administrative operations for managing ratings,
 * including listing all ratings, viewing specific ratings, updating,
 * and deleting ratings.
 * 
 * Endpoints covered:
 * - GET /api/ratings - List all ratings (admin only)
 * - GET /api/ratings/:ratingId - Get a specific rating
 * - PUT /api/ratings/:ratingId - Update a rating
 * - DELETE /api/ratings/:ratingId - Delete a rating
 * 
 * Test categories:
 * - Happy Path: Expected successful behavior
 * - Unhappy Path: Error handling and edge cases
 * 
 * @module tests/ratings_admin
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
// GET /api/ratings - LIST ALL RATINGS (ADMIN)
// ============================================================

/**
 * Happy Path: Get all ratings (admin).
 * Expected: 200 OK, array of all ratings.
 */
test('GET /api/ratings - returns all ratings', async (t) => {
    const { body } = await t.context.got('api/ratings');
    t.true(Array.isArray(body.data.ratings));
    t.true(body.success);
});

// ============================================================
// GET /api/ratings/:ratingId - GET SINGLE RATING (ADMIN)
// ============================================================

/**
 * Happy Path: Get a specific rating by ID.
 * Expected: 200 OK, rating data.
 */
test('GET /api/ratings/:ratingId - returns rating by ID', async (t) => {
    // First get all ratings to find a valid ID
    const { body: all } = await t.context.got('api/ratings');
    const ratingId = all.data.ratings[0].ratingId;

    const { body } = await t.context.got(`api/ratings/${ratingId}`);
    t.is(body.data.ratingId, ratingId);
    t.true(body.success);
});

/**
 * Unhappy Path: Non-existent rating.
 * Expected: 404 Not Found.
 */
test('GET /api/ratings/:ratingId - 404 for non-existent rating', async (t) => {
    try {
        await t.context.got('api/ratings/999999');
    } catch (error) {
        t.is(error.response.statusCode, 404);
    }
});

// ============================================================
// PUT /api/ratings/:ratingId - UPDATE RATING (ADMIN)
// ============================================================

/**
 * Happy Path: Update a rating.
 * Expected: 200 OK, updated rating data.
 */
test('PUT /api/ratings/:ratingId - updates rating', async (t) => {
    // First get all ratings to find a valid ID
    const { body: all } = await t.context.got('api/ratings');
    const ratingId = all.data.ratings[0].ratingId;

    const updateData = { score: 1 };
    const { body } = await t.context.got.put(`api/ratings/${ratingId}`, { json: updateData });

    t.true(body.success);
    t.is(body.data.score, 1);
});

/**
 * Unhappy Path: Non-existent rating.
 * Expected: 404 Not Found.
 */
test('PUT /api/ratings/:ratingId - 404 for non-existent rating', async (t) => {
    try {
        await t.context.got.put('api/ratings/999999', { json: { score: 5 } });
    } catch (error) {
        t.is(error.response.statusCode, 404);
    }
});

// ============================================================
// DELETE /api/ratings/:ratingId - DELETE RATING (ADMIN)
// ============================================================

/**
 * Happy Path: Delete a rating.
 * Expected: 204 No Content, rating no longer exists.
 */
test('DELETE /api/ratings/:ratingId - deletes rating', async (t) => {
    // Create a rating to delete
    const { body: created } = await t.context.got.post('api/works/1/ratings', {
        json: { userId: 2, score: 4 }
    });
    const ratingId = created.data.ratingId;

    // Delete the rating
    const { statusCode } = await t.context.got.delete(`api/ratings/${ratingId}`);
    t.is(statusCode, 204);

    // Verify the rating is gone
    try {
        await t.context.got(`api/ratings/${ratingId}`);
    } catch (error) {
        t.is(error.response.statusCode, 404);
    }
});

/**
 * Unhappy Path: Non-existent rating.
 * Expected: 404 Not Found.
 */
test('DELETE /api/ratings/:ratingId - 404 for non-existent rating', async (t) => {
    try {
        await t.context.got.delete('api/ratings/999999');
    } catch (error) {
        t.is(error.response.statusCode, 404);
    }
});
