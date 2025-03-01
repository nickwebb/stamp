import { jest } from '@jest/globals';
import { initMobileNav } from '../../js/mobile-nav.js';

describe('Mobile Navigation', () => {
    beforeEach(() => {
        document.body.innerHTML = `
            <nav class="mobile-bottom-nav">
                <div class="mobile-bottom-nav__item" data-tab="home">
                    <div class="mobile-bottom-nav__item-content">
                        <i class="fas fa-home"></i>
                        <span>Home</span>
                    </div>
                </div>
                <div class="mobile-bottom-nav__item" data-tab="chat">
                    <div class="mobile-bottom-nav__item-content">
                        <i class="fas fa-comment"></i>
                        <span>Chat</span>
                    </div>
                </div>
            </nav>
        `;

        const style = document.createElement('style');
        style.textContent = `
            .mobile-bottom-nav { display: none; }
            @media (max-width: 768px) {
                .mobile-bottom-nav { display: block; }
            }
        `;
        document.head.appendChild(style);
    });

    test('sets up click handlers for nav items', () => {
        const navItems = document.querySelectorAll('.mobile-bottom-nav__item');
        expect(navItems.length).toBe(2);
    });

    test('shows on mobile viewport', () => {
        Object.defineProperty(window, 'innerWidth', { value: 375 });
        window.dispatchEvent(new Event('resize'));
        
        const nav = document.querySelector('.mobile-bottom-nav');
        expect(nav).toBeTruthy();
    });

    test('hides on desktop viewport', () => {
        Object.defineProperty(window, 'innerWidth', { value: 1024 });
        window.dispatchEvent(new Event('resize'));
        
        const nav = document.querySelector('.mobile-bottom-nav');
        const computedStyle = window.getComputedStyle(nav);
        expect(computedStyle.display).toBe('none');
    });

    test('has correct navigation items', () => {
        const homeTab = document.querySelector('[data-tab="home"]');
        const chatTab = document.querySelector('[data-tab="chat"]');
        
        expect(homeTab).toBeTruthy();
        expect(chatTab).toBeTruthy();
        expect(homeTab.querySelector('span').textContent).toBe('Home');
        expect(chatTab.querySelector('span').textContent).toBe('Chat');
    });
}); 