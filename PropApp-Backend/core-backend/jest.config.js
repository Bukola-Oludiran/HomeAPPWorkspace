/**
 * Jest Configuration
 */

module.exports = {
    preset: 'ts-jest',
    testEnvironment: 'node',
    roots: ['<rootDir>/src', '<rootDir>/tests'],
    testMatch: ['**/*.test.ts', '**/*.spec.ts'],
    transform: {
        '^.+\\.tsx?$': 'ts-jest',
    },
    moduleNameMapper: {
        '^@/(.*)$': '<rootDir>/src/$1',
        '^@modules/(.*)$': '<rootDir>/src/modules/$1',
        '^@common/(.*)$': '<rootDir>/src/common/$1',
        '^@config/(.*)$': '<rootDir>/src/config/$1',
        '^@integrations/(.*)$': '<rootDir>/src/integrations/$1',
        '^@homeai/contracts/(.*)$': '<rootDir>/../../contracts/$1',
        '^@complyflow/sdk$': '<rootDir>/tests/__mocks__/complyflow-sdk.ts',
        '^@complyflow/shared$': '<rootDir>/tests/__mocks__/complyflow-shared.ts',
    },
    collectCoverageFrom: [
        'src/**/*.ts',
        '!src/**/*.d.ts',
        '!src/index.ts',
    ],
    coverageDirectory: 'coverage',
    coverageReporters: ['text', 'lcov', 'html'],
    setupFilesAfterEnv: ['<rootDir>/tests/setup.ts'],
    testTimeout: 10000,
};
