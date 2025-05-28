/**
 * Simple HTML Parser
 * A lightweight HTML parser that uses regex to extract and modify HTML content
 */

class SimpleHTMLParser {
    constructor(html) {
        this.html = html;
    }

    // Get all links in the document
    getLinks() {
        const linkRegex = /<a[^>]+href=["']([^"']+)["'][^>]*>([^<]+)<\/a>/g;
        const links = [];
        let match;

        while ((match = linkRegex.exec(this.html)) !== null) {
            links.push({
                href: match[1],
                text: match[2].trim(),
                fullMatch: match[0]
            });
        }

        return links;
    }

    // Get element by selector (simple version)
    getElement(selector) {
        if (selector.startsWith('.')) {
            const className = selector.slice(1);
            const regex = new RegExp(`<[^>]+class=["'][^"']*${className}[^"']*["'][^>]*>([\\s\\S]*?)<\\/[^>]+>`, 'i');
            const match = this.html.match(regex);
            return match ? match[0] : null;
        }
        return null;
    }

    // Get all elements by selector (simple version)
    getElements(selector) {
        if (selector.startsWith('.')) {
            const className = selector.slice(1);
            const regex = new RegExp(`<[^>]+class=["'][^"']*${className}[^"']*["'][^>]*>([\\s\\S]*?)<\\/[^>]+>`, 'gi');
            const matches = this.html.match(regex) || [];
            return matches;
        }
        return [];
    }

    // Replace content in the document
    replaceContent(oldContent, newContent) {
        this.html = this.html.replace(oldContent, newContent);
    }

    // Get the modified HTML
    getHTML() {
        return this.html;
    }

    // Extract text content from HTML
    getTextContent(html) {
        return html.replace(/<[^>]+>/g, '').trim();
    }

    // Extract date from time element or text
    extractDate(element) {
        if (!element) return null;

        // Try to find datetime attribute
        const datetimeMatch = element.match(/datetime=["']([^"']+)["']/);
        if (datetimeMatch) {
            return new Date(datetimeMatch[1]);
        }

        // Try to find date in text content
        const text = this.getTextContent(element);
        const dateMatch = text.match(/\d{4}-\d{2}-\d{2}|\d{2}\/\d{2}\/\d{4}/);
        if (dateMatch) {
            return new Date(dateMatch[0]);
        }

        return null;
    }
}

module.exports = SimpleHTMLParser; 