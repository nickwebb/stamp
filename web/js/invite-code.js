// Helper functions
function showLoadingState() {
    const button = document.querySelector('.invite-input-container .btn');
    if (button) {
        button.textContent = 'Loading...';
        button.disabled = true;
    }
}

function hideLoadingState() {
    const button = document.querySelector('.invite-input-container .btn');
    if (button) {
        button.textContent = 'Submit';
        button.disabled = false;
    }
}

function showError(message) {
    const errorElement = document.getElementById('inviteCodeError');
    if (errorElement) {
        errorElement.textContent = message;
        errorElement.style.display = 'block';
    }
}

async function validateInviteCode(code) {
    if (!code) {
        throw new Error('Please enter an invite code');
    }

    // Add your API call here
    // For now, we'll simulate an API call
    await new Promise(resolve => setTimeout(resolve, 1000)); // Simulate network delay

    // For testing, accept any 6-character code
    if (code.length !== 6) {
        throw new Error('Invalid invite code format. Please check and try again.');
    }

    // Return mock artist data
    return {
        name: 'Test Artist',
        genre: 'Electronic',
        id: '123'
    };
}

function handleInviteCodeResult(artistData) {
    // Clear any previous errors
    const errorElement = document.getElementById('inviteCodeError');
    if (errorElement) {
        errorElement.style.display = 'none';
    }

    // Store the artist data
    localStorage.setItem('invitedArtist', JSON.stringify(artistData));

    // Redirect to the artist's page
    window.location.href = `/artist/${artistData.id}`;
}

export async function handleInviteCode() {
    try {
        const input = document.getElementById('inviteCodeInput');
        const errorElement = document.getElementById('inviteCodeError');
        
        if (!input || !errorElement) {
            console.error('Required elements not found');
            return;
        }

        const code = input.value.trim().toUpperCase();
        
        if (!code) {
            showError('Please enter an invite code');
            return;
        }

        // Show loading state
        input.disabled = true;
        showLoadingState();
        
        const artistData = await validateInviteCode(code);
        
        // Handle success/error
        handleInviteCodeResult(artistData);
    } catch (error) {
        console.error('Error handling invite code:', error);
        showError(error.message || 'An unexpected error occurred. Please try again.');
    } finally {
        hideLoadingState();
        const input = document.getElementById('inviteCodeInput');
        if (input) {
            input.disabled = false;
        }
    }
}

// Initialize event listeners
document.addEventListener('DOMContentLoaded', () => {
    const submitButton = document.querySelector('.invite-input-container .btn');
    if (submitButton) {
        submitButton.addEventListener('click', handleInviteCode);
    }

    // Also handle Enter key in the input field
    const input = document.getElementById('inviteCodeInput');
    if (input) {
        input.addEventListener('keypress', (e) => {
            if (e.key === 'Enter') {
                handleInviteCode();
            }
        });
    }
}); 