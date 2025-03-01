import { fileURLToPath } from 'url';
import { dirname, resolve } from 'path';

const __dirname = dirname(fileURLToPath(import.meta.url));
const projectRoot = resolve(__dirname, '..');

const config = {
    testEnvironment: 'jsdom',
    setupFilesAfterEnv: [resolve(projectRoot, 'web/jest.setup.mjs')],
    moduleNameMapper: {
        '\\.(css|less|scss|sass)$': resolve(projectRoot, 'tests/__mocks__/styleMock.js'),
        '\\.(jpg|jpeg|png|gif|webp|svg)$': resolve(projectRoot, 'tests/__mocks__/fileMock.js'),
        '^../../js/(.*)$': resolve(projectRoot, 'web/js/$1')
    },
    transform: {
        '^.+\\.m?js$': ['babel-jest', {
            presets: [
                ['@babel/preset-env', {
                    targets: {
                        node: 'current'
                    },
                    modules: 'auto'
                }]
            ]
        }]
    },
    testMatch: [resolve(projectRoot, 'tests/**/*.test.js')],
    rootDir: projectRoot,
    transformIgnorePatterns: [
        'node_modules/(?!(@testing-library/jest-dom|@jest/globals)/)'
    ],
    moduleFileExtensions: ['js', 'mjs', 'cjs', 'jsx', 'json'],
    testEnvironmentOptions: {
        customExportConditions: ['node', 'node-addons']
    },
    globals: {
        __DEBUG__: true
    }
};

// Debug logging
console.log('Jest Config Debug:');
console.log('Root Dir:', process.cwd());
console.log('Config Directory:', __dirname);
console.log('Node Path:', process.env.NODE_PATH);
console.log('Resolved Test Pattern:', `${process.cwd()}/../tests/**/*.test.js`);

// Test file system access
import { existsSync, readdirSync } from 'fs';
const testDir = `${process.cwd()}/../tests`;
console.log('Tests Directory Exists:', existsSync(testDir));
if (existsSync(testDir)) {
    console.log('Tests Directory Contents:', readdirSync(testDir));
    console.log('API Tests Directory Contents:', readdirSync(`${testDir}/api`));
}

export default config; 