# Sin Wave - Personal Website

A clean, modern, and responsive personal website for showcasing technical articles, projects, and professional information.

## Project Structure

```
.
├── catalog/                # Content categories
│   ├── cybersecurity/      # Cybersecurity articles
│   └── music-theory/       # Music theory articles
├── components/             # Reusable HTML components
├── css/                    # Stylesheet organization
│   ├── components/         # Component-specific styles
│   ├── foundation/         # Base styles and variables
│   └── pages/              # Page-specific styles
├── js/                     # JavaScript files
│   ├── modules/            # JavaScript modules for specific functionality
│   └── main.js             # Main script for common functionality
├── templates/              # HTML templates for creating new pages
└── update-site.sh          # Script to update site metadata
```

## CSS Organization

The CSS is organized into a logical structure:

- **foundation/** - Core styles, variables, and layout
- **components/** - Reusable UI components
- **pages/** - Page-specific styles

## JavaScript Organization

JavaScript is modularized for better maintenance:

- **js/modules/** - Contains specific functionality modules
- **js/main.js** - Core site functionality

## Site Update Utility

The site includes an update utility to keep article counts, navigation, and metadata in sync.

### Running the Update Script

After making changes to content or structure, run:

```bash
./update-site.sh
```

This script will:

1. Count articles in each category and update the main catalog
2. Update "previous" and "next" navigation links in articles
3. Ensure consistent metadata across all HTML files
4. Fix script paths to reflect the correct module structure

### Requirements

- Node.js
- JSDOM (installed automatically by the script)

## Components System

The site uses a component system to maintain consistency across pages. Component HTML files in the `components/` directory are loaded dynamically by the `components.js` module.

Main components:
- Header
- Navigation
- Footer

## Adding New Content

1. Create new articles in the appropriate category directory
2. Run the update script to refresh navigation and counts
3. Verify the article appears in the category index

## HTML Structure Requirements

For articles to work properly with the update script, they should follow these guidelines:

1. Use proper semantic HTML with `<footer class="article-footer">` for the article footer section
2. Avoid using `<div class="article-footer">` (the script will attempt to fix this, but it's better to use the proper structure from the start)
3. Article titles should use the `.article-title` class
4. Date information should be in the `.article-meta` section
5. Main content should be in a `.article-content` container

Example article structure:

```html
<article class="article-container">
  <header class="article-header">
    <h1 class="article-title">Article Title</h1>
    <div class="article-meta">
      <!-- Date, reading time, etc. -->
    </div>
  </header>
  
  <div class="article-content">
    <!-- Main content here -->
    
    <footer class="article-footer">
      <div class="nav-links">
        <!-- Navigation links added by update script -->
      </div>
    </footer>
  </div>
</article>
```

The update script will automatically handle:
- Navigation between articles (previous/next links)
- Back to library links
- Article counts in category indexes 