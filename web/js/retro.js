// Single source of truth for state management
class RetroMode {
    static init() {
        console.log('RetroMode initializing...');
        
        // Set up observers once
        this.setupFooterObserver();
        this.setupBodyObserver();
        
        // Check saved state
        const savedMode = localStorage.getItem('nineties-mode') === 'true';
        if (savedMode) {
            document.body.classList.add('nineties-mode');
        } else {
            document.body.classList.remove('nineties-mode');
        }
        
        // Initial visibility update
        this.updateRetroVisibility();
    }

    static setupFooterObserver() {
        const observer = new MutationObserver(() => {
            const retroToggle = document.querySelector('.retro-mode a');
            if (retroToggle && !retroToggle._hasClickHandler) {
                retroToggle.addEventListener('click', this.toggle.bind(this));
                retroToggle._hasClickHandler = true;
                console.log('Retro toggle handler attached');
            }
        });

        observer.observe(document.body, { childList: true, subtree: true });
    }

    static setupBodyObserver() {
        const observer = new MutationObserver((mutations) => {
            mutations.forEach((mutation) => {
                if (mutation.attributeName === 'class') {
                    this.updateRetroVisibility();
                }
            });
        });

        observer.observe(document.body, { attributes: true, attributeFilter: ['class'] });
    }

    static updateRetroVisibility() {
        const isNinetiesMode = document.body.classList.contains('nineties-mode');
        
        // Update retro counter
        const retroCounter = document.querySelector('.retro-counter');
        if (retroCounter) {
            retroCounter.style.display = isNinetiesMode ? 'block' : 'none';
        }

        // Update retro sections
        const retroSections = document.querySelectorAll('.retro-section');
        retroSections.forEach(section => {
            section.style.display = isNinetiesMode ? 'block' : 'none';
        });

        // Update matrix banner if it exists
        const matrixBanner = document.getElementById('matrix-banner');
        if (matrixBanner) {
            matrixBanner.style.display = isNinetiesMode ? 'block' : 'none';
            if (isNinetiesMode) {
                setTimeout(() => {
                    matrixBanner.style.display = 'none';
                }, 3000);
            }
        }
    }

    static toggle(event) {
        event?.preventDefault();
        
        // Toggle class
        document.body.classList.toggle('nineties-mode');
        const isNinetiesMode = document.body.classList.contains('nineties-mode');
        
        // Save state
        localStorage.setItem('nineties-mode', isNinetiesMode);
        
        // Update visibility
        this.updateRetroVisibility();
    }
}

// Export the initialization function that main.js expects
export function initRetroMode() {
    RetroMode.init();
}

// Make toggle available globally
window.toggle90sMode = (event) => RetroMode.toggle(event);

// Initialize on DOM ready
document.addEventListener('DOMContentLoaded', function() {
    RetroMode.init();
}); 