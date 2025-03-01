export function initMobileNav(loadTab) {
    const navItems = document.querySelectorAll('.mobile-bottom-nav .nav-item');
    let isNavigating = false;

    navItems.forEach(item => {
        item.addEventListener('click', () => {
            if (isNavigating) return;
            isNavigating = true;

            const tab = item.getAttribute('data-tab');
            
            // Remove active class from all items
            navItems.forEach(navItem => navItem.classList.remove('active'));
            // Add active class to clicked item
            item.classList.add('active');

            loadTab(tab);
            
            setTimeout(() => {
                isNavigating = false;
            }, 300);
        });
    });
} 