/**
 * Cybersecurity Library - Search and Filter Functionality
 */

document.addEventListener('DOMContentLoaded', function() {
    // Article search functionality
    const searchInput = document.getElementById('articleSearch');
    const articlesList = document.getElementById('articlesList');
    const articleCards = articlesList.querySelectorAll('.article-card');
    const noResults = document.getElementById('noResults');
    
    if (searchInput && articlesList) {
        searchInput.addEventListener('input', function() {
            const searchTerm = this.value.toLowerCase();
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
    
    // Category filtering
    const categoryTags = document.querySelectorAll('.category-tag');
    
    categoryTags.forEach(tag => {
        tag.addEventListener('click', function() {
            // Remove active class from all tags
            categoryTags.forEach(t => t.classList.remove('active'));
            
            // Add active class to clicked tag
            this.classList.add('active');
            
            const category = this.getAttribute('data-category');
            
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
}); 