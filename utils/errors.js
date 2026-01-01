/**
 * Custom Error Classes
 */

export class NotFoundError extends Error {
    constructor(message) {
        super(message);
        this.name = 'NotFoundError';
        this.statusCode = 404;
    }
}

export class ValidationError extends Error {
    constructor(message, errors = []) {
        super(message);
        this.name = 'ValidationError';
        this.statusCode = 400;
        this.errors = errors;
    }
}

export class UserExistsError extends Error {
    constructor(message = 'User already exists') {
        super(message);
        this.name = 'UserExistsError';
        this.statusCode = 400;
    }
}

export class AuthenticationError extends Error {
    constructor(message = 'Invalid credentials') {
        super(message);
        this.name = 'AuthenticationError';
        this.statusCode = 401;
    }
}
