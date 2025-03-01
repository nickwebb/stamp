import '@testing-library/jest-dom';
import { jest } from '@jest/globals';

// Mock window.location
const locationMock = {
    href: '',
    pathname: '/'
};

Object.defineProperty(window, 'location', {
    value: locationMock,
    writable: true
});

// Mock localStorage
const localStorageMock = {
    store: {},
    getItem: jest.fn(key => localStorageMock.store[key] || null),
    setItem: jest.fn((key, value) => {
        localStorageMock.store[key] = value.toString();
    }),
    clear: jest.fn(() => {
        localStorageMock.store = {};
    }),
    removeItem: jest.fn(key => {
        delete localStorageMock.store[key];
    }),
    length: 0,
    key: jest.fn()
};

Object.defineProperty(window, 'localStorage', {
    value: localStorageMock
});

// Mock fetch
global.fetch = jest.fn();

// Mock console methods
global.console = {
    ...console,
    log: jest.fn(),
    error: jest.fn(),
    warn: jest.fn()
}; 