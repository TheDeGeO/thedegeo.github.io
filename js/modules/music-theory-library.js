/**
 * Music Theory Library - Search Functionality
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
}); 