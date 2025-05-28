/**
 * Code Highlighting Module
 * Initializes syntax highlighting for code blocks using highlight.js
 */

// Load highlight.js script
const script = document.createElement('script');
script.src = 'https://cdnjs.cloudflare.com/ajax/libs/highlight.js/11.9.0/highlight.min.js';
script.onload = () => {
    // Initialize highlight.js
    hljs.configure({
        languages: ['javascript', 'html', 'css', 'http', 'bash', 'json', 'sql', 'python', 'java', 'c', 'cpp', 'csharp', 'php', 'ruby', 'go', 'rust', 'typescript', 'xml', 'yaml', 'markdown', 'shell', 'powershell', 'dockerfile', 'ini', 'nginx', 'apache', 'diff', 'git', 'makefile', 'plaintext']
    });
    
    // Highlight all code blocks
    document.querySelectorAll('pre code').forEach((block) => {
        hljs.highlightElement(block);
    });
};
document.head.appendChild(script); 