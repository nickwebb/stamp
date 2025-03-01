import { loadTab } from '../dashboard.js';

export function initNavigation() {
    // Tab switching functionality
    const tabLinks = document.querySelectorAll('.sidebar-nav li');
    const mobileNavItems = document.querySelectorAll('.mobile-bottom-nav .nav-item');
    
    // Handle sidebar tab clicks
    tabLinks.forEach(link => {
        link.addEventListener('click', function() {
            const tabId = this.getAttribute('data-tab');
            activateTab(tabId);
        });
    });
    
    // Handle mobile nav clicks
    mobileNavItems.forEach(item => {
        item.addEventListener('click', function(e) {
            e.preventDefault();
            const tabId = this.getAttribute('data-tab');
            activateTab(tabId);
        });
    });
    
    // Get initial tab from URL or default to chat
    const urlParams = new URLSearchParams(window.location.search);
    const initialTab = urlParams.get('tab') || 'chat';
    activateTab(initialTab);
}

function activateTab(tabId) {
    // Update sidebar
    document.querySelectorAll('.sidebar-nav li').forEach(item => {
        item.classList.toggle('active', item.getAttribute('data-tab') === tabId);
    });
    
    // Update mobile nav
    document.querySelectorAll('.mobile-bottom-nav .nav-item').forEach(item => {
        item.classList.toggle('active', item.getAttribute('data-tab') === tabId);
    });
    
    // Load tab content
    loadTab(tabId);
} 