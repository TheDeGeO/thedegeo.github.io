document.addEventListener('DOMContentLoaded', function() {
    // Initialize code highlighting
    document.querySelectorAll('pre code').forEach((block) => {
        // Add loading state
        block.parentElement.classList.add('loading');
        
        // Detect language
        const language = block.className.replace('language-', '');
        block.parentElement.setAttribute('data-language', language);
        
        // Add copy button
        addCopyButton(block.parentElement);
        
        // Remove loading state
        block.parentElement.classList.remove('loading');
    });
    
    // Smooth scrolling for navigation links
    const navLinks = document.querySelectorAll('nav a, .nav-link');
    
    navLinks.forEach(link => {
        link.addEventListener('click', function(e) {
            const targetId = this.getAttribute('href');
            
            if (targetId && targetId.startsWith('#')) {
                e.preventDefault();
                
                const targetElement = document.querySelector(targetId);
                
                if (targetElement) {
                    window.scrollTo({
                        top: targetElement.offsetTop - 70, // Offset for fixed nav
                        behavior: 'smooth'
                    });
                }
            }
        });
    });
    
    // Form submission handling
    const contactForm = document.querySelector('#contact-form');
    
    if (contactForm) {
        contactForm.addEventListener('submit', function(e) {
            e.preventDefault();
            
            // Get form values
            const name = document.getElementById('name').value;
            const email = document.getElementById('email').value;
            const message = document.getElementById('message').value;
            
            // Simple validation
            if (!name || !email || !message) {
                alert('Please fill out all fields');
                return;
            }
            
            // Here you would typically send the form data to a server
            // For demo purposes, we'll just show a success message
            alert('Thanks for your message! I\'ll get back to you soon.');
            contactForm.reset();
        });
    }
    
    // Animated entrance for content cards
    const observerOptions = {
        threshold: 0.1,
        rootMargin: '0px 0px -50px 0px'
    };
    
    const observer = new IntersectionObserver(function(entries) {
        entries.forEach(entry => {
            if (entry.isIntersecting) {
                entry.target.style.opacity = '1';
                entry.target.style.transform = 'translateY(0)';
                observer.unobserve(entry.target);
            }
        });
    }, observerOptions);
    
    // Observe all content cards and article cards
    const cards = document.querySelectorAll('.content-card, .article-card, .catalog-card');
    cards.forEach(card => {
        card.style.opacity = '0';
        card.style.transform = 'translateY(20px)';
        card.style.transition = 'opacity 0.5s ease, transform 0.5s ease';
        observer.observe(card);
    });
}); 

// Add copy button to code blocks
function addCopyButton(preElement) {
    const button = document.createElement('button');
    button.className = 'copy-button';
    button.textContent = 'Copy';
    
    button.addEventListener('click', async () => {
        const code = preElement.querySelector('code').textContent;
        
        try {
            await navigator.clipboard.writeText(code);
            button.textContent = 'Copied!';
            setTimeout(() => {
                button.textContent = 'Copy';
            }, 2000);
        } catch (err) {
            button.textContent = 'Failed to copy';
            setTimeout(() => {
                button.textContent = 'Copy';
            }, 2000);
        }
    });
    
    preElement.appendChild(button);
} 