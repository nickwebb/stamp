import { login, logout, checkAuth } from '../../js/auth.js';

describe('Authentication', () => {
    beforeEach(() => {
        localStorage.clear();
        window.config = {
            apiUrl: 'https://stamp-api.nickwebb.workers.dev'
        };
    });

    describe('Login', () => {
        test('successful login stores token and user data', async () => {
            const mockResponse = {
                token: 'test-token',
                user: { id: 1, name: 'Test User', email: 'test@example.com' }
            };

            global.fetch = jest.fn(() => Promise.resolve({
                ok: true,
                json: () => Promise.resolve(mockResponse)
            }));

            await login('test@example.com', 'password');
            expect(localStorage.getItem('authToken')).toBeTruthy();
        });

        test('handles invalid credentials', async () => {
            global.fetch = jest.fn(() => Promise.resolve({
                ok: false,
                status: 401,
                json: () => Promise.resolve({ message: 'Invalid credentials' })
            }));

            await expect(login('test@example.com', 'wrong')).rejects.toThrow();
        });
    });

    describe('Logout', () => {
        test('clears localStorage', () => {
            localStorage.setItem('authToken', 'test-token');
            logout();
            expect(localStorage.getItem('authToken')).toBeNull();
        });
    });
}); 