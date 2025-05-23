/**
 * Simple template processor for static site generation
 * This helps maintain consistent styles and layouts across pages
 */

class TemplateProcessor {
    constructor(templateContent) {
        this.template = templateContent;
        this.placeholders = {};
    }

    /**
     * Set a placeholder value
     * @param {string} key - The placeholder key (without {% %})
     * @param {string} value - The value to replace it with
     */
    set(key, value) {
        this.placeholders[key] = value;
        return this;
    }

    /**
     * Set multiple placeholder values at once
     * @param {Object} values - An object with key-value pairs
     */
    setMultiple(values) {
        for (const key in values) {
            this.set(key, values[key]);
        }
        return this;
    }

    /**
     * Set a conditional block (if/else)
     * @param {string} key - The condition variable name
     * @param {boolean} condition - Whether the condition is true
     */
    setCondition(key, condition) {
        // Find the if block
        const ifRegex = new RegExp(`{% if ${key} %}([\\s\\S]*?)(?:{% else %}([\\s\\S]*?))?{% endif %}`, 'g');
        
        this.template = this.template.replace(ifRegex, (match, ifContent, elseContent) => {
            if (condition) {
                return ifContent || '';
            } else {
                return elseContent || '';
            }
        });
        
        return this;
    }
    
    /**
     * Process the template and return the final HTML
     */
    process() {
        let result = this.template;
        
        // Replace all placeholders
        for (const [key, value] of Object.entries(this.placeholders)) {
            const regex = new RegExp(`{% ${key} %}`, 'g');
            result = result.replace(regex, value);
        }
        
        return result;
    }
}

/**
 * Load a template from a file path
 * @param {string} templatePath - Path to the template file
 * @returns {Promise<TemplateProcessor>}
 */
async function loadTemplate(templatePath) {
    const response = await fetch(templatePath);
    const templateContent = await response.text();
    return new TemplateProcessor(templateContent);
}

// Export for use in other files
if (typeof module !== 'undefined' && module.exports) {
    module.exports = { TemplateProcessor, loadTemplate };
} 