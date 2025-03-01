import { initColors, setRandomColorScheme } from './colors.js';
import { initRetroMode } from './retro.js';
import { checkAuth, logout } from './auth.js';
import { handleInviteCode } from './invite-code.js';

// Initialize everything when DOM is loaded
document.addEventListener('DOMContentLoaded', () => {
    initColors();
    initRetroMode();
    checkAuth();
    
    // Add event listeners
    window.addEventListener('storage', (e) => {
        if (e.key === 'authToken' || e.key === 'user') {
            checkAuth();
        }
    });

    const inviteInput = document.getElementById('inviteCodeInput');
    if (inviteInput) {
        inviteInput.addEventListener('keypress', (e) => {
            if (e.key === 'Enter') {
                handleInviteCode();
            }
        });
    }
});

// Make functions available globally if needed
window.logout = logout;
window.handleInviteCode = handleInviteCode; 