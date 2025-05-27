// Mobile Navigation Menu Toggle
document.addEventListener('DOMContentLoaded', function() {
    const menuToggle = document.querySelector('.menu-toggle');
    const navButtons = document.querySelector('.nav-buttons');

    if (menuToggle && navButtons) {
        menuToggle.addEventListener('click', function() {
            navButtons.classList.toggle('active');
            // Update aria-expanded for accessibility
            const isExpanded = navButtons.classList.contains('active');
            menuToggle.setAttribute('aria-expanded', isExpanded);
        });

        // Close menu when clicking outside
        document.addEventListener('click', function(event) {
            if (!event.target.closest('.nav-buttons') && 
                !event.target.closest('.menu-toggle') && 
                navButtons.classList.contains('active')) {
                navButtons.classList.remove('active');
                menuToggle.setAttribute('aria-expanded', false);
            }
        });

        // Close menu when clicking a nav link (for smooth scrolling to sections)
        navButtons.querySelectorAll('a').forEach(link => {
            link.addEventListener('click', () => {
                navButtons.classList.remove('active');
                menuToggle.setAttribute('aria-expanded', false);
            });
        });
    }
}); 