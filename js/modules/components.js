/**
 * Component Loader
 * Automatically loads and injects reusable components (nav, header, footer)
 * into pages, ensuring consistency across the site.
 */

class ComponentLoader {
    constructor() {
        this.components = new Map();
        this.rootPath = this.calculateRootPath();
        console.log('ComponentLoader initialized');
        console.log('Current pathname:', window.location.pathname);
        console.log('Calculated root path:', this.rootPath);
    }

    /**
     * Calculate the root path based on current page depth
     */
    calculateRootPath() {
        const path = window.location.pathname;
        console.log('Path analysis - pathname:', path);
        
        // Remove leading slash and split by /
        const pathParts = path.replace(/^\//, '').split('/').filter(part => part !== '');
        console.log('Path parts:', pathParts);
        
        // Remove the filename (last part) to get directory depth
        const directories = pathParts.slice(0, -1);
        console.log('Directory parts:', directories);
        
        // Calculate how many levels to go back to reach root
        const goBack = '../'.repeat(directories.length);
        const result = goBack || './';
        
        console.log('Final root path:', result);
        return result;
    }

    /**
     * Load a component from the components directory
     */
    async loadComponent(componentName) {
        if (this.components.has(componentName)) {
            console.log(`Using cached component: ${componentName}`);
            return this.components.get(componentName);
        }

        const componentUrl = `${this.rootPath}components/${componentName}.html`;
        console.log(`Attempting to load component: ${componentName} from ${componentUrl}`);

        try {
            const response = await fetch(componentUrl);
            console.log(`Fetch response for ${componentName}:`, response.status, response.statusText);
            
            if (!response.ok) {
                throw new Error(`Failed to load component: ${componentName} (${response.status})`);
            }
            
            let html = await response.text();
            console.log(`Loaded HTML for ${componentName} (${html.length} chars)`);
            
            // Replace placeholder with actual root path
            html = html.replace(/{ROOT_PATH}/g, this.rootPath);
            console.log(`Processed HTML for ${componentName} with root path: ${this.rootPath}`);
            
            this.components.set(componentName, html);
            return html;
        } catch (error) {
            console.error(`Error loading component ${componentName}:`, error);
            return '';
        }
    }

    /**
     * Inject a component into the page
     */
    async injectComponent(componentName, targetSelector) {
        console.log(`Injecting component ${componentName} into ${targetSelector}`);
        
        const target = document.querySelector(targetSelector);
        if (!target) {
            console.warn(`Target element not found: ${targetSelector}`);
            return;
        }

        const componentHTML = await this.loadComponent(componentName);
        if (componentHTML) {
            target.innerHTML = componentHTML;
            console.log(`Successfully injected ${componentName} into ${targetSelector}`);
        } else {
            console.warn(`No HTML received for component ${componentName}`);
        }

        // Trigger custom event for component loaded
        const event = new CustomEvent('componentLoaded', {
            detail: { component: componentName, target: targetSelector }
        });
        document.dispatchEvent(event);
    }

    /**
     * Initialize all components
     */
    async initializeComponents() {
        console.log('Starting component initialization...');
        
        // Define component mappings
        const componentMappings = [
            { component: 'header', selector: '#site-header' },
            { component: 'navigation', selector: '#site-navigation' },
            { component: 'footer', selector: '#site-footer' }
        ];

        // Load all components in parallel
        const loadPromises = componentMappings.map(({ component, selector }) => 
            this.injectComponent(component, selector)
        );

        await Promise.all(loadPromises);
        console.log('All components loaded, initializing navigation...');
        
        // Initialize navigation functionality after components are loaded
        this.initializeNavigation();
    }

    /**
     * Initialize navigation functionality
     */
    initializeNavigation() {
        console.log('Initializing navigation functionality...');
        
        // Check if this is the home page
        const isHomePage = window.location.pathname.endsWith('index.html') || 
                           window.location.pathname.endsWith('/') ||
                           window.location.pathname === '';
        
        console.log('Is home page:', isHomePage);
        
        // Get the header element
        const header = document.querySelector('.site-header');
        
        // Hide header if not on home page
        if (!isHomePage && header) {
            header.style.display = 'none';
            console.log('Header hidden (not home page)');
        }
        
        // Mobile menu toggle
        const menuToggle = document.querySelector('.menu-toggle');
        const navButtons = document.querySelector('.nav-buttons');
        
        if (menuToggle && navButtons) {
            console.log('Setting up mobile menu functionality');
            menuToggle.addEventListener('click', function() {
                navButtons.classList.toggle('active');
                // Change icon based on menu state
                const icon = this.querySelector('i');
                if (navButtons.classList.contains('active')) {
                    icon.classList.remove('fa-bars');
                    icon.classList.add('fa-times');
                } else {
                    icon.classList.remove('fa-times');
                    icon.classList.add('fa-bars');
                }
            });
            
            // Close menu when clicking on a link
            const navLinks = document.querySelectorAll('.nav-btn');
            navLinks.forEach(link => {
                link.addEventListener('click', function() {
                    navButtons.classList.remove('active');
                    const icon = menuToggle.querySelector('i');
                    icon.classList.remove('fa-times');
                    icon.classList.add('fa-bars');
                });
            });
        } else {
            console.warn('Mobile menu elements not found');
        }
    }
}

// Auto-initialize when DOM is loaded
document.addEventListener('DOMContentLoaded', async function() {
    console.log('DOM loaded, starting ComponentLoader...');
    try {
        const loader = new ComponentLoader();
        await loader.initializeComponents();
        console.log('ComponentLoader initialization complete!');
    } catch (error) {
        console.error('ComponentLoader initialization failed:', error);
    }
});

// Export for manual use if needed
window.ComponentLoader = ComponentLoader; 