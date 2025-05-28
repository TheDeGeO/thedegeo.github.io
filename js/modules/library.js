/**
 * Unified Library Module
 * Provides search and filtering functionality for article libraries
 */

class Library {
    constructor(options = {}) {
        this.options = {
            enableCategoryFilter: false,
            ...options
        };
        
        this.init();
    }
    
    init() {
        // Initialize search functionality
        this.initSearch();
        
        // Initialize category filtering if enabled
        if (this.options.enableCategoryFilter) {
            this.initCategoryFilter();
        }
    }
    
    initSearch() {
        const searchInput = document.getElementById('articleSearch');
        const articlesList = document.getElementById('articlesList');
        const articleCards = articlesList?.querySelectorAll('.article-card');
        const noResults = document.getElementById('noResults');
        
        if (searchInput && articlesList && articleCards) {
            searchInput.addEventListener('input', () => {
                const searchTerm = searchInput.value.toLowerCase();
                let resultsFound = false;
                
                articleCards.forEach(card => {
                    const cardTitle = card.querySelector('h3').textContent.toLowerCase();
                    const cardContent = card.querySelector('p').textContent.toLowerCase();
                    const cardTags = card.getAttribute('data-tags').toLowerCase();
                    
                    if (cardTitle.includes(searchTerm) || 
                        cardContent.includes(searchTerm) || 
                        cardTags.includes(searchTerm)) {
                        card.style.display = 'block';
                        resultsFound = true;
                    } else {
                        card.style.display = 'none';
                    }
                });
                
                // Show/hide "No results" message
                if (noResults) {
                    noResults.style.display = resultsFound ? 'none' : 'block';
                }
            });
        }
    }
    
    initCategoryFilter() {
        const categoryTags = document.querySelectorAll('.category-tag');
        const articleCards = document.querySelectorAll('.article-card');
        const noResults = document.getElementById('noResults');
        
        if (categoryTags.length && articleCards.length) {
            categoryTags.forEach(tag => {
                tag.addEventListener('click', () => {
                    // Remove active class from all tags
                    categoryTags.forEach(t => t.classList.remove('active'));
                    
                    // Add active class to clicked tag
                    tag.classList.add('active');
                    
                    const category = tag.getAttribute('data-category');
                    
                    // Show all articles if "All Topics" is selected
                    if (category === 'all') {
                        articleCards.forEach(card => {
                            card.style.display = 'block';
                        });
                        if (noResults) {
                            noResults.style.display = 'none';
                        }
                        return;
                    }
                    
                    // Filter articles by category
                    let resultsFound = false;
                    
                    articleCards.forEach(card => {
                        const cardTags = card.getAttribute('data-tags').toLowerCase();
                        
                        if (cardTags.includes(category)) {
                            card.style.display = 'block';
                            resultsFound = true;
                        } else {
                            card.style.display = 'none';
                        }
                    });
                    
                    // Show/hide "No results" message
                    if (noResults) {
                        noResults.style.display = resultsFound ? 'none' : 'block';
                    }
                });
            });
            
            // Set "All Topics" as active by default
            const allTopicsTag = document.querySelector('.category-tag[data-category="all"]');
            if (allTopicsTag) {
                allTopicsTag.classList.add('active');
            }
        }
    }
}

// Initialize libraries when DOM is loaded
document.addEventListener('DOMContentLoaded', function() {
    // Initialize Music Theory library
    if (document.querySelector('.music-theory-library')) {
        new Library({ enableCategoryFilter: true });
    }
    
    // Initialize Cybersecurity library
    if (document.querySelector('.cybersecurity-library')) {
        new Library({ enableCategoryFilter: true });
    }
}); 