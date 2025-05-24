/**
 * Site configuration
 * Central place to define site-wide variables
 */

const siteConfig = {
    // Site identity
    siteName: "David Obando",
    siteTitle: "Sin Wave",
    tagline: "Developer | Cybersecurity Enthusiast | Musician | Language Learner",
    
    // Contact and social
    email: "davidobando@protonmail.com",
    github: "TheDeGeO",
    twitter: "TheDeGeO",
    linkedin: "david-obando-blanco-566854221",
    
    // SEO
    siteDescription: "Personal website featuring blog posts, portfolio projects, and more",
    
    // Copyright
    copyrightText: "All rights reserved",
    
    // Navigation
    mainNavigation: [
        { text: "About", url: "index.html#about" },
        { text: "Blog", url: "index.html#blog" },
        { text: "Portfolio", url: "index.html#portfolio" },
        { text: "Catalog", url: "index.html#catalog" },
        { text: "Contact", url: "index.html#contact" }
    ]
};

// Export for Node.js environment
if (typeof module !== 'undefined' && module.exports) {
    module.exports = siteConfig;
} 