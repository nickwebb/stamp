import '@testing-library/jest-dom';

// Mock localStorage
const mockLocalStorage = {
  store: {},
  getItem: jest.fn((key) => mockLocalStorage.store[key] || null),
  setItem: jest.fn((key, value) => {
    mockLocalStorage.store[key] = value;
  }),
  clear: jest.fn(() => {
    mockLocalStorage.store = {};
  }),
  removeItem: jest.fn((key) => {
    delete mockLocalStorage.store[key];
  }),
  getStore: () => mockLocalStorage.store
};

global.localStorage = mockLocalStorage;
global.fetch = jest.fn();

// Spy on console methods
global.console.error = jest.fn();
global.console.log = jest.fn(); 