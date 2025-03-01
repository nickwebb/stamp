export default {
    testEnvironment: 'jsdom',
    setupFilesAfterEnv: ['<rootDir>/jest.setup.mjs'],
    moduleNameMapper: {
        '\\.(css|less|scss|sass)$': '<rootDir>/tests/__mocks__/styleMock.js',
        '\\.(jpg|jpeg|png|gif|webp|svg)$': '<rootDir>/tests/__mocks__/fileMock.js'
    },
    transform: {
        '^.+\\.js$': ['babel-jest', { configFile: './babel.config.mjs' }]
    },
    testMatch: ['**/tests/**/*.test.js'],
    verbose: true
}; 