// Code highlighting module
(function() {
    // Load highlight.js core
    const highlightScript = document.createElement('script');
    highlightScript.src = 'https://cdnjs.cloudflare.com/ajax/libs/highlight.js/11.9.0/highlight.min.js';
    document.head.appendChild(highlightScript);

    // Load language modules
    const languages = [
        'python',
        'javascript',
        'html',
        'http',
        'css',
        'json',
        'bash',
        'sql'
    ];

    // Load each language module
    languages.forEach(lang => {
        const script = document.createElement('script');
        script.src = `https://cdnjs.cloudflare.com/ajax/libs/highlight.js/11.9.0/languages/${lang}.min.js`;
        document.head.appendChild(script);
    });

    // Initialize highlighting when DOM is loaded
    document.addEventListener('DOMContentLoaded', (event) => {
        // Wait for highlight.js to load
        const checkHighlight = setInterval(() => {
            if (window.hljs) {
                clearInterval(checkHighlight);
                document.querySelectorAll('pre code').forEach((el) => {
                    hljs.highlightElement(el);
                });
            }
        }, 100);
    });
})(); 