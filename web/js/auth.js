// Add debug flag at the top of the file
const DEBUG = false;

function debugLog(...args) {
    if (DEBUG) {
        console.log(...args);
    }
}

// Use a more compatible approach for config
let config = { apiUrl: 'https://stamp-api.nickwebb.workers.dev' };

// Try to load config if we're in a module context
try {
    if (typeof window !== 'undefined' && window.config) {
        config = window.config;
    }
} catch (e) {
    console.log('Using default config');
}

document.addEventListener('DOMContentLoaded', function() {
    // Only initialize login/signup forms if we're on the login page
    const loginForm = document.getElementById('loginForm');
    const signupForm = document.getElementById('signupForm');

    // Always check auth status first - this needs to happen before anything else
    checkAuth();

    if (loginForm || signupForm) {
        initializeAuthForms(loginForm, signupForm);
    }
});

function initializeAuthForms(loginForm, signupForm) {
    const toggleSignup = document.getElementById('toggleSignup');
    const toggleLogin = document.getElementById('toggleLogin');

    // Toggle between login and signup forms
    if (toggleSignup) {
        toggleSignup.addEventListener('click', function(e) {
            e.preventDefault();
            loginForm.classList.add('hidden');
            signupForm.classList.remove('hidden');
        });
    }

    if (toggleLogin) {
        toggleLogin.addEventListener('click', function(e) {
            e.preventDefault();
            signupForm.classList.add('hidden');
            loginForm.classList.remove('hidden');
        });
    }

    // Handle login form submission
    if (loginForm) {
        // Track if a submission is in progress
        let isSubmitting = false;

        console.log('Initial auth state:', {
            hasToken: !!localStorage.getItem('authToken'),
            hasUser: !!localStorage.getItem('user'),
            userData: localStorage.getItem('user')
        });

        loginForm.addEventListener('submit', async function(e) {
            e.preventDefault();
            
            if (isSubmitting) {
                console.log('Form already submitting, preventing double submission');
                return;
            }
            
            isSubmitting = true;
            const submitButton = loginForm.querySelector('button[type="submit"]');
            submitButton.disabled = true;
            
            // Clear any existing auth state
            localStorage.removeItem('authToken');
            localStorage.removeItem('user');
            
            try {
                console.log('Form submission started, clearing existing auth state...');

                const formData = {
                    email: document.getElementById('email').value,
                    password: document.getElementById('password').value
                };

                console.log('Form data:', formData);

                console.log('Sending login request to API...');
                
                // Create an AbortController for timeout handling
                const controller = new AbortController();
                const timeoutId = setTimeout(() => {
                    console.log('Request timeout triggered');
                    controller.abort();
                }, 10000); // 10 second timeout
                
                try {
                    console.log('Fetch request starting...');
                    const response = await fetch('https://stamp-api.nickwebb.workers.dev/api/auth/login', {
                        method: 'POST',
                        headers: {
                            'Content-Type': 'application/json',
                            'Accept': 'application/json'
                        },
                        mode: 'cors',
                        body: JSON.stringify(formData),
                        signal: controller.signal
                    });
                    
                    clearTimeout(timeoutId);
                    console.log('Fetch request completed');
                    
                    console.log('Login response received:', {
                        status: response.status,
                        statusText: response.statusText,
                        headers: Object.fromEntries([...response.headers])
                    });
                    
                    // Get the raw response text first for debugging
                    const responseText = await response.text();
                    console.log('Raw response text:', responseText);
                    
                    // Try to parse the JSON
                    let data;
                    try {
                        data = JSON.parse(responseText);
                        console.log('Login response data:', data);
                    } catch (jsonError) {
                        console.error('Failed to parse JSON response:', jsonError);
                        throw new Error('Invalid response format from server');
                    }
                    
                    if (!response.ok) {
                        // Check for specific status codes
                        if (response.status === 401) {
                            throw new Error('Invalid email or password. Please try again.');
                        }
                        throw new Error(data.message || 'Login failed');
                    }
                    
                    if (!data.token) {
                        throw new Error('No authentication token received');
                    }
                    
                    console.log('Login successful, storing credentials...');
                    localStorage.setItem('authToken', data.token);
                    localStorage.setItem('user', JSON.stringify({
                        id: data.user.id,
                        name: data.user.name,
                        email: data.user.email,
                        type: data.user.type || 'artist'
                    }));
                    
                    console.log('Auth state after login:', {
                        hasToken: !!localStorage.getItem('authToken'),
                        hasUser: !!localStorage.getItem('user'),
                        userData: localStorage.getItem('user')
                    });
                    
                    // Redirect with a parameter to ensure proper CSS loading
                    console.log('Redirecting to dashboard...');
                    window.location.href = '/dashboard.html?fresh=true';
                    return; // Prevent further execution
                } catch (fetchError) {
                    clearTimeout(timeoutId);
                    console.error('Fetch error:', fetchError);
                    
                    // Check if it's an abort error (timeout)
                    if (fetchError.name === 'AbortError') {
                        console.log('Request was aborted (timeout)');
                        showError('Login request timed out. Please try again.');
                        return;
                    }
                    
                    // Check for network errors
                    if (!navigator.onLine) {
                        console.log('Browser is offline');
                        showError('You appear to be offline. Please check your internet connection.');
                        return;
                    }
                    
                    // For invalid credentials (401)
                    if (fetchError.message === 'Invalid email or password. Please try again.') {
                        showError(fetchError.message);
                        return;
                    }
                    
                    // For CORS or other network errors
                    console.log('Other fetch error:', fetchError.message);
                    showError('Unable to connect to the server. Please try again later.');
                    return;
                }
            } catch (error) {
                console.error('Login error:', error);
                showError(error.message || 'An error occurred during login. Please try again.');
            } finally {
                isSubmitting = false;
                submitButton.disabled = false;
            }
        });
    }

    // Handle signup form submission
    if (signupForm) {
        let isSubmitting = false;  // Add submission tracking

        signupForm.addEventListener('submit', async function(e) {
            e.preventDefault();
            
            if (isSubmitting) {
                console.log('Form already submitting, preventing double submission');
                return;
            }
            
            isSubmitting = true;
            const submitButton = signupForm.querySelector('button[type="submit"]');
            submitButton.disabled = true;

            console.log('Signup form submitted');

            const password = document.getElementById('signupPassword').value;
            const confirmPassword = document.getElementById('confirmPassword').value;

            // Add password validation
            if (password !== confirmPassword) {
                showError('Passwords do not match');
                isSubmitting = false;
                submitButton.disabled = false;
                return;
            }

            if (password.length < 6) {
                showError('Password must be at least 6 characters long');
                isSubmitting = false;
                submitButton.disabled = false;
                return;
            }

            const formData = {
                name: document.getElementById('signupName').value,
                email: document.getElementById('signupEmail').value,
                password: password
            };

            console.log('Signup form data:', formData);

            try {
                console.log('Sending registration request to API...');
                const response = await fetch('https://stamp-api.nickwebb.workers.dev/api/auth/register', {
                    method: 'POST',
                    headers: {
                        'Content-Type': 'application/json',
                        'Accept': 'application/json'
                    },
                    mode: 'cors',
                    body: JSON.stringify(formData)
                });

                console.log('Registration response received:', response.status);
                const data = await response.json();
                console.log('Registration response data:', data);

                if (!response.ok) {
                    const errorData = await response.json();
                    console.error('Registration failed:', errorData);
                    
                    if (response.status === 400 && errorData.message === 'User already exists') {
                        showError('This email is already registered. Please use a different email or try logging in.');
                    } else {
                        showError(errorData.message || 'Registration failed. Please try again.');
                    }
                    return;
                }

                if (!data.token) {
                    throw new Error('No authentication token received');
                }

                if (!data.user || !data.user.name) {
                    throw new Error('Invalid user data received');
                }

                console.log('Registration successful, storing credentials...');
                localStorage.setItem('authToken', data.token);
                localStorage.setItem('user', JSON.stringify({
                    name: data.user.name,
                    email: data.user.email,
                    type: data.user.type || 'artist'
                }));

                console.log('Redirecting to dashboard...');
                window.location.href = '/dashboard.html';
            } catch (error) {
                console.error('Registration error:', error);
                showError('Connection error: Unable to reach the server. Please try again later.');
            } finally {
                isSubmitting = false;
                submitButton.disabled = false;
            }
        });
    }
}

// Keep the style check function but simplify it
function ensureStylesLoaded() {
    debugLog('Checking styles...');
    return true; // Simplified since we're loading styles in head
}

export async function login(email, password) {
    try {
        debugLog('Login attempt started');
        
        const response = await fetch(`${window.config.apiUrl}/api/auth/login`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify({ email, password })
        });

        const data = await response.json();

        if (!response.ok) {
            switch (response.status) {
                case 401:
                    throw new Error('Invalid email or password');
                case 404:
                    throw new Error('Login service not found');
                case 429:
                    throw new Error('Too many login attempts. Please try again later');
                case 500:
                    throw new Error('Server error. Please try again later');
                default:
                    throw new Error(data.message || 'Login failed');
            }
        }

        // Store auth data
        localStorage.setItem('authToken', data.token);
        localStorage.setItem('user', JSON.stringify(data.user));
        
        debugLog('Login successful');
        
        // Redirect to dashboard
        window.location.href = '/dashboard';
        
        updateHeaderButtons();
    } catch (error) {
        debugLog('Login failed:', error.message);
        showError(error.message);
        throw error;
    }
}

export function checkAuth() {
    const token = localStorage.getItem('authToken');
    const userString = localStorage.getItem('user');
    const currentPath = window.location.pathname;
    const isLoginPage = currentPath === '/login';

    debugLog('Auth check:', { hasToken: !!token, isLoginPage });

    // Ensure styles are loaded
    ensureStylesLoaded();

    if (token && isLoginPage) {
        window.location.href = '/dashboard';
        return;
    }

    if (!token && !isLoginPage && currentPath !== '/index.html' && currentPath !== '/') {
        window.location.href = '/login';
        return;
    }

    updateHeaderButtons();
}

function showError(message) {
    let errorElement = document.querySelector('.auth-error');
    
    if (!errorElement) {
        errorElement = document.createElement('div');
        errorElement.className = 'auth-error';
        const authHeader = document.querySelector('.auth-header');
        if (authHeader) {
            authHeader.insertAdjacentElement('afterend', errorElement);
        }
    }

    errorElement.textContent = message;
    errorElement.style.display = 'block';

    const form = document.querySelector('.auth-form');
    if (form) {
        form.classList.add('shake');
        setTimeout(() => form.classList.remove('shake'), 500);
    }
}

// Initialize auth when DOM is ready
document.addEventListener('DOMContentLoaded', checkAuth);

// Call ensureStylesLoaded when the page loads
window.addEventListener('load', ensureStylesLoaded);

// Export the initAuth function but don't perform immediate redirects
export function initAuth() {
    // Only setup logout handler, don't check auth status
    // since it's already being handled by your existing auth system
    setupLogoutHandler();
}

// Handle logout
function setupLogoutHandler() {
    const logoutBtn = document.querySelector('.logout-btn');
    if (logoutBtn) {
        logoutBtn.addEventListener('click', logout);
    }
}

// Logout function
export function logout() {
    localStorage.removeItem('authToken');
    localStorage.removeItem('user');
    updateHeaderButtons();
    window.location.href = '/login.html';
}

// Make logout function available globally
window.logout = logout;

// Bind events
document.addEventListener('headerLoaded', checkAuth);

window.addEventListener('storage', function(e) {
    if (e.key === 'authToken' || e.key === 'user') {
        checkAuth();
    }
});

// Export any other functions you need
export {
    // list other functions here
};

// Add this function
export function updateHeaderButtons() {
    const loginButton = document.getElementById('loginButton');
    const dashboardButton = document.getElementById('dashboardButton');
    
    if (!loginButton || !dashboardButton) return;

    const token = localStorage.getItem('authToken');
    const user = localStorage.getItem('user');

    if (token && user) {
        loginButton.style.display = 'none';
        dashboardButton.style.display = 'block';
    } else {
        loginButton.style.display = 'block';
        dashboardButton.style.display = 'none';
    }
}

// Add this event listener
document.addEventListener('DOMContentLoaded', updateHeaderButtons); 