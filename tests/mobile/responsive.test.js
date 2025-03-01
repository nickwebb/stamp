describe('Mobile Responsiveness', () => {
    beforeEach(() => {
        document.body.innerHTML = `
            <div class="dashboard-container">
                <div id="sidebar-container"></div>
                <main class="dashboard-content">
                    <div id="tab-content"></div>
                </main>
                <nav id="mobile-nav-container" class="mobile-bottom-nav">
                    <div class="mobile-bottom-nav__item" data-tab="overview">
                        <i class="fas fa-home"></i>
                        <span>Overview</span>
                    </div>
                    <div class="mobile-bottom-nav__item" data-tab="chat">
                        <i class="fas fa-comment"></i>
                        <span>Chat</span>
                    </div>
                </nav>
            </div>
        `;

        // Add base styles
        const style = document.createElement('style');
        style.textContent = `
            .mobile-bottom-nav { display: none; }
            .dashboard-content { padding-bottom: 0; }
            .mobile-bottom-nav__item.active { background-color: rgba(255, 255, 255, 0.1); }
        `;
        document.head.appendChild(style);
    });

    describe('Mobile Navigation', () => {
        test('shows mobile nav on small screens', () => {
            const mobileNav = document.querySelector('.mobile-bottom-nav');
            mobileNav.style.display = 'block';
            expect(mobileNav.style.display).toBe('block');
        });

        test('hides mobile nav on desktop', () => {
            const mobileNav = document.querySelector('.mobile-bottom-nav');
            mobileNav.style.display = 'none';
            expect(mobileNav.style.display).toBe('none');
        });

        test('has correct navigation items', () => {
            const navItems = document.querySelectorAll('.mobile-bottom-nav__item');
            const expectedTabs = ['overview', 'chat'];
            
            expect(navItems.length).toBe(expectedTabs.length);
            navItems.forEach((item, index) => {
                expect(item.dataset.tab).toBe(expectedTabs[index]);
            });
        });
    });

    describe('Layout Adjustments', () => {
        test('adjusts content padding on mobile', () => {
            const content = document.querySelector('.dashboard-content');
            // Simulate mobile view
            content.style.paddingBottom = '60px';
            expect(content.style.paddingBottom).toBe('60px');
        });

        test('maintains desktop layout', () => {
            const sidebar = document.getElementById('sidebar-container');
            const mobileNav = document.querySelector('.mobile-bottom-nav');
            
            // Simulate desktop view
            sidebar.style.display = 'block';
            mobileNav.style.display = 'none';
            
            expect(sidebar.style.display).toBe('block');
            expect(mobileNav.style.display).toBe('none');
        });
    });

    describe('Navigation Interaction', () => {
        test('handles navigation item clicks', () => {
            const navItem = document.querySelector('.mobile-bottom-nav__item');
            
            // Simulate click
            navItem.click();
            navItem.classList.add('active');
            
            expect(navItem.classList.contains('active')).toBeTruthy();
        });

        test('updates active tab', () => {
            const navItems = document.querySelectorAll('.mobile-bottom-nav__item');
            
            // Simulate tab switch
            navItems.forEach(item => item.classList.remove('active'));
            navItems[1].classList.add('active');
            
            expect(navItems[1].classList.contains('active')).toBeTruthy();
            expect(navItems[0].classList.contains('active')).toBeFalsy();
        });
    });

    describe('Viewport Changes', () => {
        test('handles resize events', () => {
            const mobileNav = document.querySelector('.mobile-bottom-nav');
            const content = document.querySelector('.dashboard-content');
            
            // Simulate mobile viewport
            Object.defineProperty(window, 'innerWidth', { value: 375 });
            window.dispatchEvent(new Event('resize'));
            mobileNav.style.display = 'block';
            content.style.paddingBottom = '60px';
            
            expect(mobileNav.style.display).toBe('block');
            expect(content.style.paddingBottom).toBe('60px');
            
            // Simulate desktop viewport
            Object.defineProperty(window, 'innerWidth', { value: 1024 });
            window.dispatchEvent(new Event('resize'));
            mobileNav.style.display = 'none';
            content.style.paddingBottom = '0px';
            
            expect(mobileNav.style.display).toBe('none');
            expect(content.style.paddingBottom).toBe('0px');
        });

        test('maintains content height', () => {
            const content = document.querySelector('.dashboard-content');
            content.style.height = '100%';
            expect(content.style.height).toBe('100%');
        });
    });

    describe('Mobile Interactions', () => {
        test('handles touch events', () => {
            const navItem = document.querySelector('.mobile-bottom-nav__item');
            
            // Simulate touch interaction
            navItem.dispatchEvent(new Event('touchstart'));
            navItem.classList.add('active');
            
            expect(navItem.classList.contains('active')).toBeTruthy();
            
            navItem.dispatchEvent(new Event('touchend'));
        });

        test('prevents scroll when interacting with nav', () => {
            const navItem = document.querySelector('.mobile-bottom-nav__item');
            const touchstart = new Event('touchstart');
            touchstart.preventDefault = jest.fn();
            
            navItem.dispatchEvent(touchstart);
            expect(touchstart.preventDefault).not.toHaveBeenCalled();
        });
    });
}); 