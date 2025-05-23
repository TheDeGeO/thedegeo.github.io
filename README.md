# Personal Website

A personal website featuring a blog, portfolio, and other sections with a consistent design.

## Getting Started

```bash
# Install dependencies
npm install

# Start the local development server
npm start
```

## Template System

This website uses a modular template system to maintain consistent styling and functionality across all pages.

### Structure

- `css/main.css` - Contains all shared styles and variables
- `css/components/` - Contains component-specific CSS files
  - `blog.css` - Blog-specific styles
  - `portfolio.css` - Portfolio-specific styles
- `templates/` - Contains HTML templates
  - `base.html` - The base template all pages extend
  - `blog-post.html` - Template for blog posts
  - `portfolio-project.html` - Template for portfolio projects
- `js/template-processor.js` - JavaScript utility for processing templates
- `js/create-content.js` - Node.js script to generate new content from templates
- `js/check-links.js` - Tool to validate and fix internal links
- `js/site-config.js` - Central configuration for site-wide settings
- `js/update-site-info.js` - Tool to update all pages with the latest site config

### Site Configuration

All site-wide settings are stored in a single configuration file (`js/site-config.js`). This includes:

- Site name and tagline
- Navigation menu items
- Contact information
- Copyright text

When you need to make a change that affects all pages (like changing your name or tagline), simply:

1. Edit `js/site-config.js`
2. Run `npm run update-site` to update all HTML files

```bash
# After editing site-config.js, run:
npm run update-site
```

This ensures consistency across all pages without having to manually edit each file.

### CSS Variables

All colors, spacing, and other design elements are defined as CSS variables in `main.css`. This ensures consistency across all pages and makes site-wide design changes easier.

Key variables include:
- Colors: Primary (aqua), Secondary (green), Accent (blue)
- Background colors
- Font settings
- Border radius and other UI elements

### Adding New Content

#### Using the Content Generator Script

The easiest way to create new content is to use the provided npm scripts:

```bash
# Create a new blog post
npm run create:blog -- "My New Blog Post" "Technology"

# Create a new portfolio project
npm run create:project -- "My New Project" "Web Application"
```

Alternatively, you can run the scripts directly:

```bash
# Create a new blog post
node js/create-content.js blog "My New Blog Post" "Technology"

# Create a new portfolio project
node js/create-content.js portfolio "My New Project" "Web Application"
```

The script will:
1. Create a properly named HTML file in the correct directory
2. Fill in template values like title, date, and category
3. Add placeholder content that you can replace
4. Include the site-wide configuration (name, navigation, etc.)

#### Manual Method

You can also create content manually:

1. Copy the appropriate template file:
   - For blog posts: `templates/blog-post.html` → `blog/your-post-title.html`
   - For projects: `templates/portfolio-project.html` → `portfolio/your-project-name.html`

2. Replace placeholder tags in the copied file:
   - Blog posts: `{% BLOG_TITLE %}`, `{% DATE_ISO %}`, `{% DATE_DISPLAY %}`, `{% BLOG_CATEGORY %}`, etc.
   - Projects: `{% PROJECT_TITLE %}`, `{% PROJECT_DATE %}`, `{% PROJECT_TYPE %}`, etc.
   - Site config: `{% SITE_NAME %}`, `{% SITE_TAGLINE %}`, `{% NAV_ITEMS_WITH_ROOT %}`, etc.

3. Add your content where indicated in the template

### Maintaining Navigation and Links

The `js/check-links.js` tool helps maintain the integrity of internal links and navigation between blog posts:

```bash
# Run the link checker using npm script
npm run check-links

# Or run directly
node js/check-links.js
```

This tool will:
1. Check all HTML files for broken internal links
2. Update the "Previous Post" and "Next Post" navigation in blog posts based on their dates
3. Report any issues it finds

To actually apply the changes, edit the script and set `dryRun: false` in the config object.

### Modifying the Design

To change the site's design:

1. Edit the CSS variables in `css/main.css`
2. All pages will automatically reflect these changes

For example, to change the primary color from aqua to purple:
```css
:root {
    /* Change this line */
    --primary-color: var(--purple);
}
```

## Benefits of This Approach

1. **Consistency**: All pages maintain the same look and feel
2. **Maintainability**: Design changes can be made in one place
3. **Efficiency**: Create new content quickly with templates
4. **Separation of concerns**: Content, structure, and style are separated
5. **Single source of truth**: Site-wide information is stored in one place

## Development

To run this site locally:

```bash
# Using npm script (recommended)
npm start

# Or using any static file server
python -m http.server 8000
npx http-server
```

## License

All rights reserved. 