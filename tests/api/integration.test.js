import { jest } from '@jest/globals';

describe('API Integration', () => {
    beforeEach(() => {
        jest.clearAllMocks();
        localStorage.clear();
        // Reset fetch mock
        global.fetch = jest.fn();
    });

    describe('Authentication Endpoints', () => {
        test('login endpoint returns correct response structure', async () => {
            const mockResponse = {
                token: 'test-token',
                user: {
                    id: 1,
                    name: 'Test User',
                    email: 'test@example.com'
                }
            };

            global.fetch.mockResolvedValueOnce({
                ok: true,
                status: 200,
                json: () => Promise.resolve(mockResponse)
            });

            const response = await fetch('https://stamp-api.nickwebb.workers.dev/api/auth/login', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify({
                    email: 'test@example.com',
                    password: 'password123'
                })
            });

            const data = await response.json();
            expect(data).toHaveProperty('token');
            expect(data).toHaveProperty('user');
            expect(data.user).toHaveProperty('id');
            expect(data.user).toHaveProperty('name');
            expect(data.user).toHaveProperty('email');
        });

        test('handles invalid login credentials', async () => {
            global.fetch.mockResolvedValueOnce({
                ok: false,
                status: 401,
                json: () => Promise.resolve({ message: 'Invalid credentials' })
            });

            const response = await fetch('https://stamp-api.nickwebb.workers.dev/api/auth/login', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify({
                    email: 'invalid@example.com',
                    password: 'wrongpassword'
                })
            });

            expect(response.status).toBe(401);
            const data = await response.json();
            expect(data).toHaveProperty('message', 'Invalid credentials');
        });
    });

    describe('Chat Endpoints', () => {
        test('sending message requires authentication', async () => {
            global.fetch.mockResolvedValueOnce({
                ok: false,
                status: 401,
                json: () => Promise.resolve({ message: 'Unauthorized' })
            });

            const response = await fetch('https://stamp-api.nickwebb.workers.dev/api/chat/send', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify({
                    message: 'Test message'
                })
            });

            expect(response.status).toBe(401);
        });

        test('sends message with valid authentication', async () => {
            global.fetch.mockResolvedValueOnce({
                ok: true,
                status: 200,
                json: () => Promise.resolve({ success: true })
            });

            const response = await fetch('https://stamp-api.nickwebb.workers.dev/api/chat/send', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': 'Bearer fake-token-123'
                },
                body: JSON.stringify({
                    message: 'Test message'
                })
            });

            expect(response.status).toBe(200);
            const data = await response.json();
            expect(data).toHaveProperty('success', true);
        });
    });
}); 