export async function handleInviteCode() {
    try {
        const input = document.getElementById('inviteCodeInput');
        const errorElement = document.getElementById('inviteCodeError');
        
        if (!input || !errorElement) {
            console.error('Required elements not found');
            return;
        }

        const code = input.value.trim().toUpperCase();
        
        // Show loading state
        input.disabled = true;
        showLoadingState();
        
        const artistData = await validateInviteCode(code);
        
        // Handle success/error
        handleInviteCodeResult(artistData);
    } catch (error) {
        console.error('Error handling invite code:', error);
        showError('An unexpected error occurred. Please try again.');
    } finally {
        hideLoadingState();
        input.disabled = false;
    }
} 