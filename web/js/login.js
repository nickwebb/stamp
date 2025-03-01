import { login } from './auth.js';

document.addEventListener('DOMContentLoaded', () => {
    const loginForm = document.getElementById('loginForm');
    
    if (loginForm) {
        // Create error message element and insert it after auth-header
        let errorElement = document.querySelector('.auth-error');
        if (!errorElement) {
            errorElement = document.createElement('div');
            errorElement.className = 'auth-error';
            // Insert after auth-header
            const authHeader = loginForm.closest('.auth-box').querySelector('.auth-header');
            authHeader.insertAdjacentElement('afterend', errorElement);
        }

        loginForm.addEventListener('submit', async (e) => {
            e.preventDefault();
            
            const email = document.getElementById('email').value;
            const password = document.getElementById('password').value;
            const submitButton = loginForm.querySelector('.auth-btn');
            
            try {
                // Show loading state
                submitButton.disabled = true;
                submitButton.innerHTML = '<i class="fas fa-spinner fa-spin"></i> Logging in...';
                errorElement.style.display = 'none';
                
                await login(email, password);
            } catch (error) {
                // Show error message
                errorElement.textContent = error.message;
                errorElement.style.display = 'block';
                
                // Shake the form to indicate error
                loginForm.classList.add('shake');
                setTimeout(() => loginForm.classList.remove('shake'), 500);
            } finally {
                // Reset button state
                submitButton.disabled = false;
                submitButton.innerHTML = 'Login';
            }
        });
    }
});