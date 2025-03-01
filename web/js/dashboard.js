import { checkAuth, logout } from './auth.js';
import { initNavigation } from './navigation.js';
import { initChat } from './chat.js';

// Make functions available in global scope for HTML onclick handlers
window.createAnnouncement = createAnnouncement;
window.uploadExclusive = uploadExclusive;
window.scheduleAMA = scheduleAMA;
window.closeModal = closeModal;

// Initialize everything when the DOM is ready
document.addEventListener('DOMContentLoaded', async () => {
    await loadComponents();
    initNavigation();
    initializeTabs();
    
    // Load default tab (overview)
    await loadTab('overview');
});

// Load components
async function loadComponents() {
    const sidebarContainer = document.getElementById('sidebar-container');
    const mobileNavContainer = document.getElementById('mobile-nav-container');
    
    try {
        // Load sidebar
        const sidebarResponse = await fetch('/dashboard/components/sidebar.html');
        sidebarContainer.innerHTML = await sidebarResponse.text();
        
        // Update artist info after sidebar is loaded
        updateArtistInfo();
        
        // Load mobile nav
        const mobileNavResponse = await fetch('/dashboard/components/mobile-nav.html');
        mobileNavContainer.innerHTML = await mobileNavResponse.text();
    } catch (error) {
        console.error('Error loading components:', error);
    }
}

// Tab switching functionality
function initializeTabs() {
    document.addEventListener('click', async (e) => {
        const tabLink = e.target.closest('[data-tab]');
        if (tabLink) {
            e.preventDefault();
            const targetTab = tabLink.getAttribute('data-tab');
            console.log('Tab clicked:', targetTab);
            
            // Update active states
            document.querySelectorAll('[data-tab]').forEach(link => {
                link.classList.remove('active');
            });
            tabLink.classList.add('active');
            
            // Load tab content
            await loadTab(targetTab);
        }
    });
}

// Load tab content
async function loadTab(tabId) {
    const tabContent = document.getElementById('tab-content');
    try {
        console.log(`Loading tab: ${tabId}`);
        const response = await fetch(`/dashboard/components/tabs/${tabId}.html`);
        if (!response.ok) {
            throw new Error(`Failed to load tab: ${response.statusText}`);
        }
        const html = await response.text();
        
        // Insert the content
        tabContent.innerHTML = html;
        
        // Force the tab to be visible
        const tab = tabContent.firstElementChild;
        if (tab) {
            document.querySelectorAll('.dashboard-tab').forEach(t => {
                t.classList.remove('active');
            });
            tab.classList.add('active');
            tab.style.display = 'block';
            tab.style.opacity = '1';
            tab.style.transform = 'translateY(0)';
        }
        
        // Initialize tab-specific functionality
        if (tabId === 'chat') {
            initChat();
        } else if (tabId === 'insights') {
            initializeCharts();
        }
    } catch (error) {
        console.error(`Error loading tab ${tabId}:`, error);
        tabContent.innerHTML = `<div class="error-message">Error loading content. Please try again.</div>`;
    }
}

// Update active tab indicators
function updateActiveTab(activeLink) {
    // Remove active class from all nav items
    document.querySelectorAll('[data-tab]').forEach(link => {
        link.classList.remove('active');
    });
    
    // Add active class to clicked link
    activeLink.classList.add('active');
}

// Announcements functionality
function createAnnouncement() {
    const modal = document.createElement('div');
    modal.className = 'modal';
    modal.innerHTML = `
        <div class="modal-content">
            <h2>Create Announcement</h2>
            <form id="announcementForm">
                <div class="form-group">
                    <label for="title">Title</label>
                    <input type="text" id="title" required>
                </div>
                <div class="form-group">
                    <label for="content">Content</label>
                    <textarea id="content" required></textarea>
                </div>
                <div class="form-actions">
                    <button type="button" onclick="closeModal(this)">Cancel</button>
                    <button type="submit" class="btn-primary">Publish</button>
                </div>
            </form>
        </div>
    `;
    document.body.appendChild(modal);
    
    document.getElementById('announcementForm').addEventListener('submit', handleAnnouncementSubmit);
}

function handleAnnouncementSubmit(e) {
    e.preventDefault();
    // Add announcement to list
    const title = document.getElementById('title').value;
    const content = document.getElementById('content').value;
    
    const announcement = createAnnouncementElement(title, content);
    document.querySelector('.announcements-list').prepend(announcement);
    
    // Close modal
    closeModal(e.target);
}

function createAnnouncementElement(title, content) {
    const div = document.createElement('div');
    div.className = 'announcement-item';
    div.innerHTML = `
        <div class="announcement-header">
            <h3>${title}</h3>
            <span class="announcement-date">${new Date().toLocaleDateString()}</span>
        </div>
        <p class="announcement-content">${content}</p>
        <div class="announcement-stats">
            <span><i class="fas fa-eye"></i> 0 views</span>
            <span><i class="fas fa-heart"></i> 0 likes</span>
        </div>
    `;
    return div;
}

// Exclusive content functionality
function uploadExclusive() {
    const modal = document.createElement('div');
    modal.className = 'modal';
    modal.innerHTML = `
        <div class="modal-content">
            <h2>Upload Exclusive Content</h2>
            <form id="uploadForm">
                <div class="form-group">
                    <label for="contentTitle">Title</label>
                    <input type="text" id="contentTitle" required>
                </div>
                <div class="form-group">
                    <label for="contentType">Content Type</label>
                    <select id="contentType" required>
                        <option value="video">Video</option>
                        <option value="audio">Audio</option>
                        <option value="image">Image</option>
                    </select>
                </div>
                <div class="form-group">
                    <label for="contentFile">File</label>
                    <input type="file" id="contentFile" required>
                </div>
                <div class="form-group">
                    <label for="contentDescription">Description</label>
                    <textarea id="contentDescription" required></textarea>
                </div>
                <div class="form-actions">
                    <button type="button" onclick="closeModal(this)">Cancel</button>
                    <button type="submit" class="btn-primary">Upload</button>
                </div>
            </form>
        </div>
    `;
    document.body.appendChild(modal);
    
    // Handle form submission
    document.getElementById('uploadForm').addEventListener('submit', handleContentUpload);
}

// AMA Sessions functionality
function scheduleAMA() {
    const modal = document.createElement('div');
    modal.className = 'modal';
    modal.innerHTML = `
        <div class="modal-content">
            <h2>Schedule AMA Session</h2>
            <form id="amaForm">
                <div class="form-group">
                    <label for="amaTitle">Title</label>
                    <input type="text" id="amaTitle" required>
                </div>
                <div class="form-group">
                    <label for="amaDate">Date</label>
                    <input type="datetime-local" id="amaDate" required>
                </div>
                <div class="form-group">
                    <label for="amaDescription">Description</label>
                    <textarea id="amaDescription" required></textarea>
                </div>
                <div class="form-actions">
                    <button type="button" onclick="closeModal(this)">Cancel</button>
                    <button type="submit" class="btn-primary">Schedule</button>
                </div>
            </form>
        </div>
    `;
    document.body.appendChild(modal);
    
    // Handle form submission
    document.getElementById('amaForm').addEventListener('submit', handleAMASchedule);
}

// Fan Insights Charts
function initializeCharts() {
    const ctx = document.getElementById('engagementChart').getContext('2d');
    new Chart(ctx, {
        type: 'line',
        data: {
            labels: ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun'],
            datasets: [{
                label: 'Fan Engagement',
                data: [65, 78, 90, 85, 99, 112],
                borderColor: 'rgb(107, 71, 255)',
                tension: 0.4
            }]
        },
        options: {
            responsive: true,
            plugins: {
                legend: {
                    position: 'top',
                },
                title: {
                    display: true,
                    text: 'Monthly Fan Engagement'
                }
            },
            scales: {
                y: {
                    beginAtZero: true
                }
            }
        }
    });
}

// Utility functions
function closeModal(element) {
    const modal = element.closest('.modal');
    modal.remove();
}

// Handle file uploads
async function handleContentUpload(e) {
    e.preventDefault();
    // Simulate file upload
    const loadingToast = showToast('Uploading content...', 'loading');
    
    try {
        // Simulate API call
        await new Promise(resolve => setTimeout(resolve, 2000));
        
        // Add content to grid
        const title = document.getElementById('contentTitle').value;
        const type = document.getElementById('contentType').value;
        const description = document.getElementById('contentDescription').value;
        
        addContentToGrid(title, type, description);
        
        showToast('Content uploaded successfully!', 'success');
        closeModal(e.target);
    } catch (error) {
        showToast('Error uploading content', 'error');
    } finally {
        loadingToast.remove();
    }
}

function addContentToGrid(title, type, description) {
    const grid = document.querySelector('.content-grid');
    const card = document.createElement('div');
    card.className = 'content-card';
    card.innerHTML = `
        <div class="content-thumbnail">
            <img src="/images/placeholder.jpg" alt="${title}">
            <span class="content-type">${type}</span>
        </div>
        <div class="content-info">
            <h3>${title}</h3>
            <p>${description}</p>
            <div class="content-meta">
                <span><i class="fas fa-clock"></i> Just now</span>
                <span><i class="fas fa-eye"></i> 0 views</span>
            </div>
        </div>
    `;
    grid.prepend(card);
}

// Toast notification system
function showToast(message, type = 'info') {
    const toast = document.createElement('div');
    toast.className = `toast toast-${type}`;
    toast.innerHTML = `
        <div class="toast-content">
            <i class="fas ${getToastIcon(type)}"></i>
            <span>${message}</span>
        </div>
    `;
    document.body.appendChild(toast);
    
    setTimeout(() => {
        toast.remove();
    }, 3000);
    
    return toast;
}

function getToastIcon(type) {
    switch(type) {
        case 'success': return 'fa-check-circle';
        case 'error': return 'fa-exclamation-circle';
        case 'loading': return 'fa-spinner fa-spin';
        default: return 'fa-info-circle';
    }
}

// Export functions that need to be used in other modules
export {
    loadTab,
    createAnnouncement,
    uploadExclusive,
    scheduleAMA,
    closeModal
};

// Add this function
function updateArtistInfo() {
    try {
        const userString = localStorage.getItem('user');
        if (userString) {
            const user = JSON.parse(userString);
            const artistNameElement = document.querySelector('.artist-name');
            if (artistNameElement && user.name) {
                artistNameElement.textContent = user.name;
            }
        }
    } catch (error) {
        console.error('Error updating artist info:', error);
    }
}

// Add this to make chat functions available globally
window.sendMessage = sendMessage;

// Chat functionality
function sendMessage() {
    const messageInput = document.getElementById('messageInput');
    const message = messageInput.value.trim();
    
    if (message) {
        addMessageToChat('sent', message);
        messageInput.value = '';
    }
}

function addMessageToChat(type, content) {
    const chatMessages = document.getElementById('chatMessages');
    const messageDiv = document.createElement('div');
    messageDiv.className = `message ${type === 'sent' ? 'message-sent' : 'message-received'}`;
    
    messageDiv.innerHTML = `
        <div class="message-bubble">
            ${content}
        </div>
        <span class="message-time">${new Date().toLocaleTimeString()}</span>
    `;
    
    chatMessages.appendChild(messageDiv);
    chatMessages.scrollTop = chatMessages.scrollHeight;
} 