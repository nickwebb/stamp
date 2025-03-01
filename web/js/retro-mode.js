// This file now just imports and re-exports the functionality from retro.js
import { initRetroMode } from './retro.js';

// Initialize retro mode
initRetroMode();

console.log('Retro mode script loading...');

// Make the function globally available
window.toggle90sMode = function(event) {
    // Prevent default link behavior
    event?.preventDefault();
    
    console.log('Toggle90s called:', {
        eventType: event?.type,
        target: event?.target?.outerHTML,
        isTrusted: event?.isTrusted
    });
    
    const body = document.body;
    const startupSound = document.getElementById('win95-sound');
    
    // Test playing the sound directly
    if (startupSound) {
        startupSound.addEventListener('canplaythrough', () => {
            console.log('Audio can play through');
        });
        
        startupSound.addEventListener('error', (e) => {
            console.log('Audio error:', {
                error: e.target.error,
                src: startupSound.currentSrc,
                networkState: startupSound.networkState
            });
        });
    }
    
    // Debug audio element state
    console.log('Audio Debug:', {
        elementExists: !!startupSound,
        readyState: startupSound?.readyState,
        paused: startupSound?.paused,
        src: startupSound?.currentSrc,
        error: startupSound?.error,
        userGesture: event?.isTrusted,
        audioElement: startupSound
    });
    
    body.classList.toggle('nineties-mode');
    
    // Update retro counter visibility
    const retroCounter = document.querySelector('.retro-counter');
    if (retroCounter) {
        retroCounter.style.display = body.classList.contains('nineties-mode') ? 'block' : 'none';
    }
    
    // Toggle MIDI music
    if (body.classList.contains('nineties-mode')) {
        try {
            startupSound.currentTime = 0;
            startupSound.volume = 0.3;
            console.log('Attempting to play sound...');
            startupSound.play().catch(err => {
                console.log('Audio playback failed:', err.message);
            });
        } catch (err) {
            console.log('Audio error:', err.message);
        }
    } else {
        startupSound.pause();
        startupSound.currentTime = 0;
    }
    
    // Save the mode preference
    localStorage.setItem('nineties-mode', body.classList.contains('nineties-mode'));
}

// Add this event listener
document.addEventListener('DOMContentLoaded', () => {
    console.log('Retro mode DOM ready, checking elements:', {
        retroToggle: document.querySelector('.retro-mode a'),
        footer: document.querySelector('footer'),
        scriptType: document.currentScript?.type,
        moduleScope: typeof toggle90sMode !== 'undefined'
    });

    // Set up the click handler for the retro toggle
    const retroToggle = document.getElementById('retro-toggle');
    if (retroToggle) {
        retroToggle.addEventListener('click', toggle90sMode);
    }

    // Your existing DOMContentLoaded code...
    const savedMode = localStorage.getItem('nineties-mode');
    if (savedMode === 'true') {
        document.body.classList.add('nineties-mode');
        const retroCounter = document.querySelector('.retro-counter');
        if (retroCounter) {
            retroCounter.style.display = 'block';
        }
    }
});

// Log after footer loads
const footerObserver = new MutationObserver((mutations) => {
    mutations.forEach((mutation) => {
        if (mutation.addedNodes.length) {
            console.log('Footer change detected:', {
                retroToggle: document.querySelector('.retro-mode a'),
                toggleClickable: document.querySelector('.retro-mode a')?.onclick,
                moduleState: typeof toggle90sMode !== 'undefined'
            });
        }
    });
});

footerObserver.observe(document.body, { childList: true, subtree: true }); 