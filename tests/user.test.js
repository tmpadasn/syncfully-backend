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

// GET /api/users
test('GET /api/users returns all users (Happy Path 1)', async (t) => {
    const { body } = await t.context.got('api/users');
    t.true(Array.isArray(body.data));
    t.true(body.success);
    t.true(body.data.length > 0);
});

test('GET /api/users includes user properties (Happy Path 2)', async (t) => {
    const { body } = await t.context.got('api/users');
    const user = body.data[0];
    t.truthy(user.userId);
    t.truthy(user.username);
    t.truthy(user.email);
});

// GET /api/users/:userId
test('GET /api/users/:userId returns a specific user (Happy Path 1)', async (t) => {
    const { body } = await t.context.got('api/users/1');
    t.is(body.data.userId, 1);
    t.is(body.data.username, 'alice');
    t.true(body.success);
});

test('GET /api/users/:userId returns another specific user (Happy Path 2)', async (t) => {
    const { body } = await t.context.got('api/users/2');
    t.is(body.data.userId, 2);
    t.is(body.data.username, 'bob');
    t.true(body.success);
});

test('GET /api/users/:userId returns 404 for non-existent user (Unhappy Path 1)', async (t) => {
    try {
        await t.context.got('api/users/999999');
    } catch (error) {
        t.is(error.response.statusCode, 404);
    }
});

test('GET /api/users/:userId handles invalid ID format (Unhappy Path 2)', async (t) => {
    try {
        await t.context.got('api/users/invalid');
    } catch (error) {
        t.is(error.response.statusCode, 400);
    }
});

// POST /api/users
test('POST /api/users creates a new user (Happy Path 1)', async (t) => {
    const newUser = {
        username: 'testuser',
        email: 'test@example.com',
        password: 'password123'
    };

    const { body } = await t.context.got.post('api/users', {
        json: newUser
    });

    t.true(body.success);
    t.is(body.data.username, newUser.username);
    t.is(body.data.email, newUser.email);
    t.truthy(body.data.userId);
    t.falsy(body.data.password); // Password should not be returned
});

test('POST /api/users creates a user with profile picture (Happy Path 2)', async (t) => {
    const newUser = {
        username: 'pictureuser',
        email: 'picture@example.com',
        password: 'password123',
        profilePictureUrl: 'http://example.com/pic.jpg'
    };

    const { body } = await t.context.got.post('api/users', {
        json: newUser
    });

    t.true(body.success);
    t.is(body.data.profilePictureUrl, newUser.profilePictureUrl);
});

test('POST /api/users fails with missing username (Unhappy Path 1)', async (t) => {
    const invalidUser = {
        email: 'test@example.com',
        password: 'password123'
    };

    try {
        await t.context.got.post('api/users', {
            json: invalidUser
        });
    } catch (error) {
        t.is(error.response.statusCode, 400);
    }
});

test('POST /api/users fails with missing email (Unhappy Path 2)', async (t) => {
    const invalidUser = {
        username: 'testuser',
        password: 'password123'
    };

    try {
        await t.context.got.post('api/users', {
            json: invalidUser
        });
    } catch (error) {
        t.is(error.response.statusCode, 400);
    }
});

test('POST /api/users fails with missing password (Unhappy Path 3)', async (t) => {
    const invalidUser = {
        username: 'testuser',
        email: 'test@example.com'
    };

    try {
        await t.context.got.post('api/users', {
            json: invalidUser
        });
    } catch (error) {
        t.is(error.response.statusCode, 400);
    }
});

test('POST /api/users fails with duplicate username (Unhappy Path 4)', async (t) => {
    const duplicateUser = {
        username: 'alice', // Already exists in mock data
        email: 'newalice@example.com',
        password: 'password123'
    };

    try {
        await t.context.got.post('api/users', {
            json: duplicateUser
        });
    } catch (error) {
        t.is(error.response.statusCode, 400);
    }
});

test('POST /api/users fails with duplicate email (Unhappy Path 5)', async (t) => {
    const duplicateUser = {
        username: 'newalice',
        email: 'alice@example.com', // Already exists in mock data
        password: 'password123'
    };

    try {
        await t.context.got.post('api/users', {
            json: duplicateUser
        });
    } catch (error) {
        t.is(error.response.statusCode, 400);
    }
});

// PUT /api/users/:userId
test('PUT /api/users/:userId updates user username (Happy Path 1)', async (t) => {
    // Create user first
    const newUser = {
        username: 'updateme',
        email: 'update@example.com',
        password: 'password123'
    };
    const { body: created } = await t.context.got.post('api/users', { json: newUser });
    const userId = created.data.userId;

    const updateData = {
        username: 'updated'
    };

    const { body } = await t.context.got.put(`api/users/${userId}`, {
        json: updateData
    });

    t.true(body.success);
    t.is(body.data.username, updateData.username);
});

test('PUT /api/users/:userId updates multiple fields (Happy Path 2)', async (t) => {
    // Create user first
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

    const { body } = await t.context.got.put(`api/users/${userId}`, {
        json: updateData
    });

    t.true(body.success);
    t.is(body.data.username, updateData.username);
    t.is(body.data.email, updateData.email);
    t.is(body.data.profilePictureUrl, updateData.profilePictureUrl);
});

test('PUT /api/users/:userId returns 404 for non-existent user (Unhappy Path 1)', async (t) => {
    const updateData = {
        username: 'newname'
    };

    try {
        await t.context.got.put('api/users/999999', {
            json: updateData
        });
    } catch (error) {
        t.is(error.response.statusCode, 404);
    }
});

test('PUT /api/users/:userId fails with duplicate username (Unhappy Path 2)', async (t) => {
    // Create user first
    const newUser = {
        username: 'conflictuser',
        email: 'conflict@example.com',
        password: 'password123'
    };
    const { body: created } = await t.context.got.post('api/users', { json: newUser });
    const userId = created.data.userId;

    const updateData = {
        username: 'alice' // Already exists in mock data
    };

    try {
        await t.context.got.put(`api/users/${userId}`, {
            json: updateData
        });
    } catch (error) {
        t.is(error.response.statusCode, 400);
    }
});

// DELETE /api/users/:userId
test('DELETE /api/users/:userId deletes a user (Happy Path 1)', async (t) => {
    // Create user first
    const newUser = {
        username: 'deleteme',
        email: 'delete@example.com',
        password: 'password123'
    };
    const { body: created } = await t.context.got.post('api/users', { json: newUser });
    const userId = created.data.userId;

    const { statusCode } = await t.context.got.delete(`api/users/${userId}`);
    t.is(statusCode, 204);

    // Verify it's gone
    try {
        await t.context.got(`api/users/${userId}`);
    } catch (error) {
        t.is(error.response.statusCode, 404);
    }
});

test('DELETE /api/users/:userId returns 404 for non-existent user (Unhappy Path 1)', async (t) => {
    try {
        await t.context.got.delete('api/users/999999');
    } catch (error) {
        t.is(error.response.statusCode, 404);
    }
});

// GET /api/users/:userId/ratings
test('GET /api/users/:userId/ratings returns user ratings (Happy Path 1)', async (t) => {
    const { body } = await t.context.got('api/users/1/ratings');
    t.true(body.success);
    t.truthy(body.data);
    t.truthy(body.data.ratings !== undefined);
});

test('GET /api/users/:userId/ratings returns empty for user with no ratings (Happy Path 2)', async (t) => {
    // Create user with no ratings
    const newUser = {
        username: 'noratings',
        email: 'noratings@example.com',
        password: 'password123'
    };
    const { body: created } = await t.context.got.post('api/users', { json: newUser });
    const userId = created.data.userId;

    const { body } = await t.context.got(`api/users/${userId}/ratings`);
    t.true(body.success);
    t.is(body.data.ratings, 0);
});

test('GET /api/users/:userId/ratings returns 404 for non-existent user (Unhappy Path 1)', async (t) => {
    try {
        await t.context.got('api/users/999999/ratings');
    } catch (error) {
        t.is(error.response.statusCode, 404);
    }
});

// POST /api/users/:userId/ratings
test('POST /api/users/:userId/ratings adds a rating (Happy Path 1)', async (t) => {
    const ratingData = {
        workId: 1,
        score: 5
    };

    const { body } = await t.context.got.post('api/users/1/ratings', {
        json: ratingData
    });

    t.true(body.success);
    t.truthy(body.data);
});

test('POST /api/users/:userId/ratings adds rating with decimal score (Happy Path 2)', async (t) => {
    const ratingData = {
        workId: 2,
        score: 3.5
    };

    const { body } = await t.context.got.post('api/users/2/ratings', {
        json: ratingData
    });

    t.true(body.success);
    t.truthy(body.data);
});

test('POST /api/users/:userId/ratings fails with missing workId (Unhappy Path 1)', async (t) => {
    const ratingData = {
        score: 5
    };

    try {
        await t.context.got.post('api/users/1/ratings', {
            json: ratingData
        });
    } catch (error) {
        t.is(error.response.statusCode, 400);
    }
});

test('POST /api/users/:userId/ratings fails with invalid score (Unhappy Path 2)', async (t) => {
    const ratingData = {
        workId: 1,
        score: 6 // Invalid score > 5
    };

    try {
        await t.context.got.post('api/users/1/ratings', {
            json: ratingData
        });
    } catch (error) {
        t.is(error.response.statusCode, 400);
    }
});

test('POST /api/users/:userId/ratings returns 404 for non-existent user (Unhappy Path 3)', async (t) => {
    const ratingData = {
        workId: 1,
        score: 5
    };

    try {
        await t.context.got.post('api/users/999999/ratings', {
            json: ratingData
        });
    } catch (error) {
        t.is(error.response.statusCode, 404);
    }
});

// GET /api/users/:userId/recommendations
test('GET /api/users/:userId/recommendations returns recommendations (Happy Path 1)', async (t) => {
    const { body } = await t.context.got('api/users/1/recommendations');
    t.true(body.success);
    t.truthy(body.data.current);
    t.truthy(body.data.profile);
    t.truthy(body.data.version);
    t.true(Array.isArray(body.data.current));
    t.true(Array.isArray(body.data.profile));
});

test('GET /api/users/:userId/recommendations returns limited recommendations (Happy Path 2)', async (t) => {
    const { body } = await t.context.got('api/users/2/recommendations');
    t.true(body.data.current.length <= 5);
    t.true(body.data.profile.length <= 5);
});

test('GET /api/users/:userId/recommendations returns 404 for non-existent user (Unhappy Path 1)', async (t) => {
    try {
        await t.context.got('api/users/999999/recommendations');
    } catch (error) {
        t.is(error.response.statusCode, 404);
    }
});

// GET /api/users/:userId/following
test('GET /api/users/:userId/following returns following list (Happy Path 1)', async (t) => {
    const { body } = await t.context.got('api/users/1/following');
    t.true(body.success);
    t.true(Array.isArray(body.data.following));
    t.true(body.data.following.length > 0); // Alice follows others in mock data
});

test('GET /api/users/:userId/following returns empty for user with no following (Happy Path 2)', async (t) => {
    const { body } = await t.context.got('api/users/8/following'); // Henry has no following
    t.true(body.success);
    t.true(Array.isArray(body.data.following));
    t.is(body.data.following.length, 0);
});

test('GET /api/users/:userId/following returns 404 for non-existent user (Unhappy Path 1)', async (t) => {
    try {
        await t.context.got('api/users/999999/following');
    } catch (error) {
        t.is(error.response.statusCode, 404);
    }
});

// GET /api/users/:userId/followers
test('GET /api/users/:userId/followers returns followers list (Happy Path 1)', async (t) => {
    const { body } = await t.context.got('api/users/1/followers');
    t.true(body.success);
    t.true(Array.isArray(body.data.followers));
    t.true(body.data.followers.length > 0); // Alice has followers in mock data
});

test('GET /api/users/:userId/followers returns empty for user with no followers (Happy Path 2)', async (t) => {
    const { body } = await t.context.got('api/users/8/followers'); // Henry has no followers
    t.true(body.success);
    t.true(Array.isArray(body.data.followers));
    t.is(body.data.followers.length, 0);
});

test('GET /api/users/:userId/followers returns 404 for non-existent user (Unhappy Path 1)', async (t) => {
    try {
        await t.context.got('api/users/999999/followers');
    } catch (error) {
        t.is(error.response.statusCode, 404);
    }
});

// POST /api/users/:userId/following/:targetUserId
test('POST /api/users/:userId/following/:targetUserId follows a user (Happy Path 1)', async (t) => {
    // Henry follows Jack
    const { body } = await t.context.got.post('api/users/8/following/10');
    t.true(body.success);
    t.is(body.data.message, 'Successfully followed user');
});

test('POST /api/users/:userId/following/:targetUserId creates mutual follow (Happy Path 2)', async (t) => {
    // Jack follows Henry back
    const { body } = await t.context.got.post('api/users/10/following/8');
    t.true(body.success);
    t.is(body.data.message, 'Successfully followed user');
});

test('POST /api/users/:userId/following/:targetUserId fails when following self (Unhappy Path 1)', async (t) => {
    try {
        await t.context.got.post('api/users/8/following/8');
    } catch (error) {
        t.is(error.response.statusCode, 400);
        t.regex(error.response.body.error, /cannot follow yourself/i);
    }
});

test('POST /api/users/:userId/following/:targetUserId fails when already following (Unhappy Path 2)', async (t) => {
    // Try to follow again
    try {
        await t.context.got.post('api/users/8/following/10');
    } catch (error) {
        t.is(error.response.statusCode, 400);
        t.regex(error.response.body.error, /already following/i);
    }
});

test('POST /api/users/:userId/following/:targetUserId returns 404 for non-existent user (Unhappy Path 3)', async (t) => {
    try {
        await t.context.got.post('api/users/999999/following/1');
    } catch (error) {
        t.is(error.response.statusCode, 404);
    }
});

test('POST /api/users/:userId/following/:targetUserId returns 404 for non-existent target (Unhappy Path 4)', async (t) => {
    try {
        await t.context.got.post('api/users/1/following/999999');
    } catch (error) {
        t.is(error.response.statusCode, 404);
    }
});

// DELETE /api/users/:userId/following/:targetUserId
test('DELETE /api/users/:userId/following/:targetUserId unfollows a user (Happy Path 1)', async (t) => {
    // Henry unfollows Jack
    const { body } = await t.context.got.delete('api/users/8/following/10');
    t.true(body.success);
    t.is(body.data.message, 'Successfully unfollowed user');
});

test('DELETE /api/users/:userId/following/:targetUserId removes from both lists (Happy Path 2)', async (t) => {
    // Verify Henry is no longer in Jack's followers
    const { body: followers } = await t.context.got('api/users/10/followers');
    const henryInFollowers = followers.data.followers.some(f => f.userId === 8);
    t.false(henryInFollowers);

    // Verify Jack is no longer in Henry's following
    const { body: following } = await t.context.got('api/users/8/following');
    const jackInFollowing = following.data.following.some(f => f.userId === 10);
    t.false(jackInFollowing);
});

test('DELETE /api/users/:userId/following/:targetUserId fails when not following (Unhappy Path 1)', async (t) => {
    try {
        await t.context.got.delete('api/users/8/following/10'); // Already unfollowed
    } catch (error) {
        t.is(error.response.statusCode, 400);
        t.regex(error.response.body.error, /not following/i);
    }
});

test('DELETE /api/users/:userId/following/:targetUserId returns 404 for non-existent user (Unhappy Path 2)', async (t) => {
    try {
        await t.context.got.delete('api/users/999999/following/1');
    } catch (error) {
        t.is(error.response.statusCode, 404);
    }
});

test('DELETE /api/users/:userId/following/:targetUserId returns 404 for non-existent target (Unhappy Path 3)', async (t) => {
    try {
        await t.context.got.delete('api/users/1/following/999999');
    } catch (error) {
        t.is(error.response.statusCode, 404);
    }
});
