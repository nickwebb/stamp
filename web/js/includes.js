import { updateHeaderButtons } from './auth.js';

document.addEventListener('DOMContentLoaded', function() {
    console.log('Includes.js: Starting to load header/footer');
    
    // Determine which header to load
    const isDashboard = window.location.pathname.includes('dashboard');
    
    const loadComponent = async (url, targetSelector, insertMethod = 'innerHTML') => {
        try {
            const response = await fetch(url);
            if (!response.ok) throw new Error(`Failed to load ${url}`);
            const html = await response.text();
            
            if (insertMethod === 'innerHTML' && document.querySelector(targetSelector)) {
                document.querySelector(targetSelector).innerHTML = html;
            } else if (insertMethod === 'afterbegin') {
                document.body.insertAdjacentHTML('afterbegin', html);
            } else if (insertMethod === 'beforeend') {
                document.body.insertAdjacentHTML('beforeend', html);
            }
            
            document.dispatchEvent(new Event('componentLoaded'));
            
            // Update header buttons after header is loaded
            if (url.includes('header.html')) {
                updateHeaderButtons();
            }
        } catch (error) {
            console.error(`Error loading ${url}:`, error);
        }
    };

    if (isDashboard) {
        // Load dashboard header
        if (document.getElementById('dashboard-header')) {
            loadComponent('/includes/dashboard-header.html', '#dashboard-header');
        }
    } else {
        // Load regular header
        loadComponent('/includes/header.html', 'body', 'afterbegin')
            .then(() => document.dispatchEvent(new Event('headerLoaded')));
    }

    // Load footer (only if not already present and not on dashboard)
    if (!document.querySelector('footer') && !isDashboard) {
        loadComponent('/includes/footer.html', 'body', 'beforeend');
    }
}); 