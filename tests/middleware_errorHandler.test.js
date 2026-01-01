/**
 * Error Handler Middleware Tests
 * Tests all error types handled by errorHandler and notFoundHandler
 * Coverage: custom errors, JWT errors, generic errors, 404 handler
 */
import test from 'ava';
import got from 'got';
import listen from 'test-listen';
import http from 'http';
import express from 'express';
import { errorHandler, notFoundHandler } from '../middleware/errorHandler.js';
import { NotFoundError, ValidationError, UserExistsError, AuthenticationError } from '../utils/errors.js';

const createTestApp = () => {
  const app = express();
  app.use(express.json());
  return app;
};

// Setup test server with routes that trigger different error types
test.before(async (t) => {
  const app = createTestApp();

  // Custom error class routes
  app.get('/not-found-error', () => {
    throw new NotFoundError('Resource not found');
  });

  app.get('/validation-error-with-errors', () => {
    throw new ValidationError('Validation failed', ['Field 1 is required', 'Field 2 is invalid']);
  });

  // Edge case: empty errors array should return undefined
  app.get('/validation-error-empty', () => {
    throw new ValidationError('Validation failed', []);
  });

  app.get('/user-exists-error', () => {
    throw new UserExistsError('User already exists');
  });

  app.get('/authentication-error', () => {
    throw new AuthenticationError('Invalid credentials');
  });

  // JWT error routes - simulate JWT library errors
  app.get('/jwt-invalid', () => {
    const err = new Error('Invalid token');
    err.name = 'JsonWebTokenError';
    throw err;
  });

  app.get('/jwt-expired', () => {
    const err = new Error('Token expired');
    err.name = 'TokenExpiredError';
    throw err;
  });

  // Generic error fallback
  app.get('/generic-error', () => {
    throw new Error('Unexpected error');
  });

  app.use(errorHandler);
  app.use(notFoundHandler);

  t.context.server = http.createServer(app);
  t.context.prefixUrl = await listen(t.context.server);
  t.context.got = got.extend({
    prefixUrl: t.context.prefixUrl,
    responseType: 'json',
    throwHttpErrors: false
  });
});

// Cleanup server after all tests
test.after.always((t) => {
  t.context.server.close();
});

// Custom error class tests
test('errorHandler - handles NotFoundError', async (t) => {
  const { body, statusCode } = await t.context.got.get('not-found-error');
  t.is(statusCode, 404);
  t.false(body.success);
  t.is(body.message, 'Resource not found');
});

test('errorHandler - handles ValidationError with errors array', async (t) => {
  const { body, statusCode } = await t.context.got.get('validation-error-with-errors');
  t.is(statusCode, 400);
  t.false(body.success);
  t.is(body.message, 'Validation failed');
  t.true(Array.isArray(body.errors));
  t.is(body.errors.length, 2);
});

test('errorHandler - handles ValidationError with empty errors array', async (t) => {
  const { body, statusCode } = await t.context.got.get('validation-error-empty');
  t.is(statusCode, 400);
  t.false(body.success);
  t.is(body.message, 'Validation failed');
  t.is(body.errors, undefined);
});

test('errorHandler - handles UserExistsError', async (t) => {
  const { body, statusCode } = await t.context.got.get('user-exists-error');
  t.is(statusCode, 400);
  t.false(body.success);
  t.is(body.message, 'User already exists');
});

test('errorHandler - handles AuthenticationError', async (t) => {
  const { body, statusCode } = await t.context.got.get('authentication-error');
  t.is(statusCode, 401);
  t.false(body.success);
  t.is(body.message, 'Invalid credentials');
});

// JWT error tests
test('errorHandler - handles JWT JsonWebTokenError', async (t) => {
  const { body, statusCode } = await t.context.got.get('jwt-invalid');
  t.is(statusCode, 401);
  t.false(body.success);
  t.is(body.message, 'Invalid token');
});

test('errorHandler - handles JWT TokenExpiredError', async (t) => {
  const { body, statusCode } = await t.context.got.get('jwt-expired');
  t.is(statusCode, 401);
  t.false(body.success);
  t.is(body.message, 'Token expired');
});

// Default error handler test
test('errorHandler - handles generic error with 500', async (t) => {
  const { body, statusCode } = await t.context.got.get('generic-error');
  t.is(statusCode, 500);
  t.false(body.success);
  t.is(body.message, 'Internal server error');
});

// 404 handler test
test('notFoundHandler - returns 404 for non-existent route', async (t) => {
  const { body, statusCode } = await t.context.got.get('non-existent-route');
  t.is(statusCode, 404);
  t.false(body.success);
  t.regex(body.message, /Route.*not found/);
});
