/**
 * Jest Test Setup
 */

// Set test environment variables
process.env.NODE_ENV = 'test';
process.env.JWT_SECRET = 'test-jwt-secret-key-for-testing-32chars';
process.env.DATABASE_URL = 'postgresql://homeai:homeai_dev@localhost:5432/homeai_test?schema=public';
process.env.DEFAULT_REGION = 'NG';
process.env.FRONTEND_URL = 'http://localhost:5173';

// Increase timeout for database operations
jest.setTimeout(10000);

// Clear all mocks after each test
afterEach(() => {
    jest.clearAllMocks();
});
