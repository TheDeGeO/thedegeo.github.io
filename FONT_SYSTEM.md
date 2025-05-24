# Centralized Font System

## Overview

This site uses a centralized font management system to improve maintainability and scalability. All font definitions are managed through a single CSS file.

## Architecture

### Core File
- **`css/fonts.css`** - Single source of truth for all font imports and definitions

### Font Source
- **Primary Font**: Fantasque Sans Mono from [CDN Fonts](https://fonts.cdnfonts.com/css/fantasque-sans-mono)
- **Fallbacks**: Courier New, monospace for code elements; system fonts for body text

## CSS Variables

The system defines CSS custom properties for consistent font usage:

```css
:root {
    --font-mono: 'Fantasque Sans Mono', 'Courier New', monospace;
    --font-sans: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif;
}
```

## Usage

### In HTML Files
All HTML files automatically include the font system via:
```html
<link rel="stylesheet" href="[path]/css/fonts.css">
```

### In CSS Files
Use the CSS variables for consistent font application:
```css
/* For code elements */
.code-block {
    font-family: var(--font-mono);
}

/* For body text */
.content {
    font-family: var(--font-sans);
}
```

## Benefits

1. **Single Source of Truth**: Change fonts in one place (`css/fonts.css`)
2. **Easy Updates**: Update font source or add new fonts without touching individual files
3. **Performance**: Centralized loading reduces duplicate requests
4. **Consistency**: CSS variables ensure uniform font usage across the site
5. **Fallbacks**: Built-in fallback fonts for better compatibility

## Updating Fonts

To change or add fonts:

1. Edit `css/fonts.css`
2. Update the `@import` statement for new font sources
3. Modify CSS variables as needed
4. All pages will automatically use the new fonts

## File Coverage

The font system is automatically included in:
- All main pages (`index.html`, catalog pages, etc.)
- All template files (`templates/*.html`)
- All blog and portfolio pages

## Migration Notes

- **Previous System**: Individual `<link>` tags to fontlibrary.org in each HTML file
- **Current System**: Single `css/fonts.css` file imported by all pages
- **Migration Date**: [Current Date]
- **Benefits Gained**: Improved maintainability, better performance, easier updates 