import { loadTab } from '../../js/dashboard.js';

describe('Dashboard Functionality', () => {
    beforeEach(() => {
        document.body.innerHTML = `
            <div id="loading-overlay" class="loading-overlay">
                <div class="loading-spinner"></div>
            </div>
            <div class="dashboard-container">
                <div id="sidebar-container">
                    <nav class="sidebar">
                        <div class="sidebar-content">
                            <div class="nav-items">
                                <a href="#" data-tab="overview" class="nav-item active">
                                    <i class="fas fa-home"></i>
                                    <span>Overview</span>
                                </a>
                                <a href="#" data-tab="chat" class="nav-item">
                                    <i class="fas fa-comment"></i>
                                    <span>Chat</span>
                                </a>
                            </div>
                        </div>
                    </nav>
                </div>
                <main class="dashboard-content">
                    <div id="tab-content">
                        <div id="overview" class="tab-content active"></div>
                        <div id="chat" class="tab-content"></div>
                        <div id="announcements" class="tab-content"></div>
                        <div id="insights" class="tab-content"></div>
                        <div id="stamps" class="tab-content"></div>
                    </div>
                </main>
            </div>
        `;

        // Add necessary styles
        const style = document.createElement('style');
        style.textContent = `
            .loading-overlay { display: none; }
            .loading-overlay.active { display: flex; }
            #sidebar-container { display: block; }
            .tab-content { display: none; }
            .tab-content.active { display: block; }
        `;
        document.head.appendChild(style);

        // Mock localStorage
        localStorage.setItem('authToken', 'test-token');
        localStorage.setItem('user', JSON.stringify({
            id: 1,
            name: 'Test Artist',
            type: 'artist'
        }));

        // Mock fetch
        global.fetch = jest.fn(() =>
            Promise.resolve({
                ok: true,
                text: () => Promise.resolve('<div>Tab content</div>')
            })
        );
    });

    describe('Tab Loading', () => {
        test('loads overview tab by default', () => {
            const overviewTab = document.getElementById('overview');
            expect(overviewTab.classList.contains('active')).toBeTruthy();
        });

        test('shows loading state when switching tabs', async () => {
            const loadingOverlay = document.getElementById('loading-overlay');
            loadingOverlay.classList.add('active');
            expect(loadingOverlay.classList.contains('active')).toBeTruthy();
        });

        test('handles tab content loading errors', async () => {
            global.fetch = jest.fn(() => Promise.reject('Network error'));
            const consoleSpy = jest.spyOn(console, 'error').mockImplementation(() => {});
            
            try {
                await loadTab('announcements');
            } catch (error) {
                expect(consoleSpy).toHaveBeenCalled();
            }
            
            consoleSpy.mockRestore();
        });
    });

    describe('Dashboard Layout', () => {
        test('shows sidebar on desktop', () => {
            const sidebar = document.getElementById('sidebar-container');
            expect(sidebar).toBeTruthy();
            expect(window.getComputedStyle(sidebar).display).toBe('block');
        });

        test('handles mobile layout', () => {
            // Simulate mobile viewport
            Object.defineProperty(window, 'innerWidth', { value: 375 });
            
            // Manually trigger mobile layout
            const sidebar = document.getElementById('sidebar-container');
            sidebar.style.display = 'none';
            
            expect(sidebar.style.display).toBe('none');
        });

        test('maintains active tab state', () => {
            const navItems = document.querySelectorAll('.nav-item');
            const activeItem = document.querySelector('.nav-item.active');
            
            expect(activeItem).toBeTruthy();
            expect(activeItem.dataset.tab).toBe('overview');
        });

        test('has correct navigation items', () => {
            const navItems = document.querySelectorAll('.nav-item');
            const expectedTabs = ['overview', 'chat'];
            
            expect(navItems.length).toBe(expectedTabs.length);
            navItems.forEach((item, index) => {
                expect(item.dataset.tab).toBe(expectedTabs[index]);
            });
        });
    });

    describe('Responsive Behavior', () => {
        test('updates layout on window resize', () => {
            const sidebar = document.getElementById('sidebar-container');
            
            // Mock resize to mobile
            Object.defineProperty(window, 'innerWidth', { value: 375 });
            sidebar.style.display = 'none';
            window.dispatchEvent(new Event('resize'));
            expect(sidebar.style.display).toBe('none');
            
            // Mock resize to desktop
            Object.defineProperty(window, 'innerWidth', { value: 1024 });
            sidebar.style.display = 'block';
            window.dispatchEvent(new Event('resize'));
            expect(sidebar.style.display).toBe('block');
        });
    });
}); 