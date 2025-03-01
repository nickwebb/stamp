import { updateHeaderButtons } from '../../js/auth.js';

describe('Header Navigation', () => {
    beforeEach(() => {
        document.body.innerHTML = `
            <div class="header-right">
                <button class="login-btn" id="loginButton" onclick="window.location.href='login.html'">Sign Up / Login</button>
                <button class="login-btn" id="dashboardButton" onclick="window.location.href='dashboard.html'" style="display: none;">Dashboard</button>
            </div>
        `;
    });

    test('shows login button when user is not logged in', () => {
        localStorage.clear();
        updateHeaderButtons();
        
        const loginButton = document.getElementById('loginButton');
        const dashboardButton = document.getElementById('dashboardButton');
        
        expect(loginButton.style.display).toBe('block');
        expect(dashboardButton.style.display).toBe('none');
    });

    test('shows dashboard button when user is logged in', () => {
        // Set up auth data
        localStorage.setItem('authToken', 'test-token');
        localStorage.setItem('user', JSON.stringify({
            id: 1,
            name: 'Test User',
            email: 'test@example.com'
        }));

        // Trigger the update
        updateHeaderButtons();
        
        const loginButton = document.getElementById('loginButton');
        const dashboardButton = document.getElementById('dashboardButton');
        
        expect(loginButton.style.display).toBe('none');
        expect(dashboardButton.style.display).toBe('block');
    });

    test('handles missing elements gracefully', () => {
        document.body.innerHTML = '<div></div>'; // No buttons
        expect(() => updateHeaderButtons()).not.toThrow();
    });

    test('updates correctly when auth state changes', () => {
        const loginButton = document.getElementById('loginButton');
        const dashboardButton = document.getElementById('dashboardButton');

        // Start logged out
        localStorage.clear();
        updateHeaderButtons();
        expect(loginButton.style.display).toBe('block');
        expect(dashboardButton.style.display).toBe('none');

        // Log in
        localStorage.setItem('authToken', 'test-token');
        localStorage.setItem('user', JSON.stringify({ id: 1, name: 'Test User' }));
        updateHeaderButtons();
        expect(loginButton.style.display).toBe('none');
        expect(dashboardButton.style.display).toBe('block');

        // Log out
        localStorage.clear();
        updateHeaderButtons();
        expect(loginButton.style.display).toBe('block');
        expect(dashboardButton.style.display).toBe('none');
    });
});