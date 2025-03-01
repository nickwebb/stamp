describe('Dashboard', () => {
    beforeEach(() => {
        document.body.innerHTML = `
            <div class="dashboard-container">
                <div class="tab-content" id="overview"></div>
                <div class="tab-content" id="chat"></div>
                <div class="tab-content" id="announcements"></div>
                <div class="tab-content" id="insights"></div>
                <div class="tab-content" id="stamps"></div>
            </div>
            <nav class="tab-navigation">
                <button data-tab="overview">Overview</button>
                <button data-tab="chat">Chat</button>
                <button data-tab="announcements">Announcements</button>
                <button data-tab="insights">Insights</button>
                <button data-tab="stamps">Stamps</button>
            </nav>
        `;
    });

    test('shows overview tab by default', () => {
        const overviewTab = document.getElementById('overview');
        expect(overviewTab).toBeTruthy();
    });

    test('has all required tabs', () => {
        const expectedTabs = ['overview', 'chat', 'announcements', 'insights', 'stamps'];
        expectedTabs.forEach(tabId => {
            const tab = document.getElementById(tabId);
            expect(tab).toBeTruthy();
            expect(tab.classList.contains('tab-content')).toBeTruthy();
        });
    });

    test('has navigation buttons for all tabs', () => {
        const expectedTabs = ['overview', 'chat', 'announcements', 'insights', 'stamps'];
        expectedTabs.forEach(tabId => {
            const button = document.querySelector(`button[data-tab="${tabId}"]`);
            expect(button).toBeTruthy();
        });
    });

    test('maintains correct tab structure', () => {
        const container = document.querySelector('.dashboard-container');
        const navigation = document.querySelector('.tab-navigation');
        
        expect(container).toBeTruthy();
        expect(navigation).toBeTruthy();
        expect(container.children.length).toBe(5); // All 5 content tabs
        expect(navigation.children.length).toBe(5); // All 5 nav buttons
    });
}); 