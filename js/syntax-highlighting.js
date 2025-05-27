// Import highlight.js core and specific languages
import hljs from 'highlight.js/lib/core';
import javascript from 'highlight.js/lib/languages/javascript';
import typescript from 'highlight.js/lib/languages/typescript';
import html from 'highlight.js/lib/languages/xml';
import css from 'highlight.js/lib/languages/css';
import json from 'highlight.js/lib/languages/json';
import bash from 'highlight.js/lib/languages/bash';
import python from 'highlight.js/lib/languages/python';

// Import the theme
import 'highlight.js/styles/github-dark.css';

// Register languages
hljs.registerLanguage('javascript', javascript);
hljs.registerLanguage('typescript', typescript);
hljs.registerLanguage('html', html);
hljs.registerLanguage('css', css);
hljs.registerLanguage('json', json);
hljs.registerLanguage('bash', bash);
hljs.registerLanguage('python', python);

// Initialize highlight.js
document.addEventListener('DOMContentLoaded', () => {
    // Configure highlight.js
    hljs.configure({
        ignoreUnescapedHTML: true,
        languages: ['javascript', 'typescript', 'html', 'css', 'json', 'bash', 'python']
    });

    // Highlight all code blocks
    document.querySelectorAll('pre code').forEach((block) => {
        // Add loading state
        block.parentElement.classList.add('loading');
        
        // Detect language
        const language = block.className.replace('language-', '');
        block.parentElement.setAttribute('data-language', language);
        
        // Highlight the code
        hljs.highlightElement(block);
        
        // Remove loading state
        block.parentElement.classList.remove('loading');
        
        // Add copy button
        addCopyButton(block.parentElement);
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