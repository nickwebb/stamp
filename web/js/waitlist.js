const DEBUG = true; // Enable logging

function log(...args) {
    if (DEBUG) {
        console.log('[Waitlist]', ...args);
    }
}

function logError(...args) {
    if (DEBUG) {
        console.error('[Waitlist Error]', ...args);
    }
}

export function initWaitlistForm() {
    log('Initializing waitlist form');
    
    const form = document.getElementById('waitlistForm');
    const thankYouMessage = document.getElementById('thankYouMessage');
    const debugInfo = document.getElementById('debugInfo');

    if (!form) {
        logError('Waitlist form not found in DOM');
        return;
    }

    form.addEventListener('submit', async function(e) {
        e.preventDefault();
        log('Form submission started');
        
        // Disable submit button and show loading state
        const submitButton = form.querySelector('button[type="submit"]');
        const originalButtonText = submitButton.textContent;
        submitButton.disabled = true;
        submitButton.textContent = 'Submitting...';
        
        // Clear any existing error messages
        clearErrors();

        // Get selected genres
        const selectedGenres = Array.from(document.querySelectorAll('input[name="genres"]:checked'))
            .map(checkbox => checkbox.value);
        
        const formData = {
            name: document.getElementById('name').value,
            artistName: document.getElementById('artistName').value,
            email: document.getElementById('email').value,
            comments: document.getElementById('comments').value,
            newsletter: document.getElementById('newsletter').checked
        };

        log('Submitting form data:', formData);

        try {
            log('Making API request to /api/waitlist');
            const response = await fetch('https://stamp-api.nickwebb.workers.dev/api/waitlist', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify(formData)
            });

            log('API Response status:', response.status);
            log('API Response headers:', Object.fromEntries(response.headers.entries()));

            if (response.ok) {
                log('Submission successful');
                showThankYouMessage();
            } else {
                throw new Error('Failed to join waitlist');
            }
        } catch (error) {
            logError('Submission failed:', error);
            showFormError('Sorry, there was an error joining the waitlist. Please try again later.');
            updateDebugInfo(error);
        } finally {
            // Reset submit button state
            submitButton.disabled = false;
            submitButton.textContent = originalButtonText;
        }
    });

    // Add input validation listeners
    addInputValidation();

    log('Form initialization complete');
}

function showThankYouMessage() {
    log('Showing thank you message');
    const form = document.getElementById('waitlistForm');
    const thankYouMessage = document.getElementById('thankYouMessage');
    
    form.style.display = 'none';
    thankYouMessage.style.display = 'block';
}

function showFormError(message) {
    logError('Showing error message:', message);
    const errorDiv = document.createElement('div');
    errorDiv.className = 'error-message';
    errorDiv.innerHTML = `<i class="fas fa-exclamation-circle"></i> ${message}`;
    
    const form = document.getElementById('waitlistForm');
    form.insertBefore(errorDiv, form.firstChild);
    
    setTimeout(() => {
        if (errorDiv.parentNode) {
            errorDiv.remove();
        }
    }, 5000);
}

function clearErrors() {
    log('Clearing existing errors');
    const errors = document.querySelectorAll('.error-message');
    errors.forEach(error => error.remove());
}

function updateDebugInfo(error) {
    if (!DEBUG) return;
    
    const debugInfo = document.getElementById('debugInfo');
    if (debugInfo) {
        debugInfo.innerHTML = `
            <strong>Last Error:</strong><br>
            ${error.message}<br>
            <small>${error.stack}</small>
        `;
    }
}

function addInputValidation() {
    const form = document.getElementById('waitlistForm');
    const inputs = form.querySelectorAll('input[required]');
    
    inputs.forEach(input => {
        input.addEventListener('blur', () => {
            validateInput(input);
        });
        
        input.addEventListener('input', () => {
            // Remove error styling on input
            input.classList.remove('invalid');
            const errorMessage = input.parentElement.querySelector('.input-error');
            if (errorMessage) {
                errorMessage.remove();
            }
        });
    });
}

function validateInput(input) {
    const value = input.value.trim();
    let isValid = true;
    let errorMessage = '';

    switch (input.type) {
        case 'email':
            const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
            if (!emailRegex.test(value)) {
                isValid = false;
                errorMessage = 'Please enter a valid email address';
            }
            break;
        default:
            if (!value) {
                isValid = false;
                errorMessage = `${input.name} is required`;
            }
    }

    if (!isValid) {
        input.classList.add('invalid');
        const errorDiv = document.createElement('div');
        errorDiv.className = 'input-error';
        errorDiv.textContent = errorMessage;
        input.parentElement.appendChild(errorDiv);
    }

    return isValid;
}

// Initialize the form when the DOM is loaded
document.addEventListener('DOMContentLoaded', () => {
    initWaitlistForm();
}); 