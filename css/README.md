# CSS Architecture Documentation

## Overview

This project uses a modular CSS architecture that promotes maintainability, reusability, and consistency across the website. The system is organized into distinct layers following the Inverted Triangle CSS (ITCSS) methodology.

## File Structure

```
css/
├── foundation/                 # Core styles and variables
│   ├── variables.css          # CSS custom properties (design tokens)
│   ├── base.css              # Reset, typography, global element styles
│   └── layout.css            # Container patterns and structural layouts
├── components/               # Reusable UI components
│   ├── ui-components.css     # Buttons, cards, forms, tags, etc.
│   └── content-types.css     # Article layouts, project layouts, catalogs
├── pages/                   # Page-specific styles
│   └── home.css            # Homepage-specific styling
├── main-unified.css        # Main CSS file (imports all modules)
└── README.md              # This documentation
```

## Architecture Layers

### 1. Foundation Layer (`foundation/`)

**Purpose**: Core variables, resets, and fundamental styles that everything else builds upon.

#### `variables.css`
- CSS custom properties for colors, spacing, typography, shadows, etc.
- Design tokens that ensure consistency across the site
- Semantic color mappings (e.g., `--primary-color`, `--heading-color`)
- Category-specific colors for different content types

#### `base.css`
- CSS reset and normalize
- Typography styles for all HTML elements
- Global element styles (links, lists, tables, forms)
- Utility classes for common patterns

#### `layout.css`
- Container patterns and grid systems
- Header, navigation, and footer layouts
- Responsive breakpoints and mobile navigation
- Structural layout utilities

### 2. Component Layer (`components/`)

**Purpose**: Reusable UI components that can be used across different pages and contexts.

#### `ui-components.css`
- Button variants (`.btn`, `.btn-primary`, `.btn-secondary`, etc.)
- Card components (`.card`, `.content-card`)
- Form elements (`.form`, `.form-group`)
- Tags and badges (`.tag`, `.tag-primary`)
- Navigation elements (`.nav-links`, `.breadcrumbs`)
- Search components (`.search-container`, `.search-input`)
- Social links (`.social-links`)
- Alerts and notifications (`.alert-*`)

#### `content-types.css`
- Article layouts (`.article-container`, `.article-header`)
- Project layouts (`.project-container`, `.project-gallery`)
- Catalog layouts (`.catalog-grid`, `.catalog-card`)
- Content blocks (`.info-box`, `.tip-box`, `.warning-box`)
- Feature lists and tech stacks
- Category-specific theming (`.content-cybersecurity`, `.content-music`)

### 3. Page Layer (`pages/`)

**Purpose**: Page-specific styles that don't fit into reusable components.

#### `home.css`
- Homepage-specific panel layouts (`.home-panel`, `.home-panel-full`)
- Section-specific accent colors
- About section layout with image and text
- Homepage contact form styling
- Catalog section specific styles

## Design System

### Color Palette

The site uses a **Gruvbox Material Dark Hard** color scheme with aqua, green, and blue as primary accent colors:

- **Primary**: `--aqua` (#89b482) - Main brand color
- **Secondary**: `--green` (#a9b665) - Secondary actions and highlights  
- **Accent**: `--blue` (#7daea3) - Links and interactive elements

### Spacing Scale

Consistent spacing using a scale:
- `--space-xs`: 0.5rem
- `--space-sm`: 1rem  
- `--space-md`: 1.5rem
- `--space-lg`: 2rem
- `--space-xl`: 2.5rem
- `--space-2xl`: 3rem
- `--space-3xl`: 4rem

### Typography Scale

Font sizes using a modular scale:
- `--text-xs`: 0.75rem
- `--text-sm`: 0.875rem
- `--text-base`: 1rem
- `--text-lg`: 1.125rem
- `--text-xl`: 1.25rem
- `--text-2xl`: 1.5rem
- `--text-3xl`: 1.875rem
- `--text-4xl`: 2.25rem
- `--text-5xl`: 3rem

### Border Radius System

Consistent border radius values:
- `--radius-sm`: 4px
- `--radius-md`: 8px
- `--radius-lg`: 12px
- `--radius-xl`: 20px
- `--radius-full`: 50%

## Usage Guidelines

### For New Content

When creating new content, use the standardized classes:

```html
<!-- Article layout -->
<article class="article-container content-cybersecurity">
  <header class="article-header">
    <h1 class="article-title">Article Title</h1>
    <div class="article-meta">
      <span class="article-meta-item">
        <i class="fas fa-calendar"></i>
        <time datetime="2024-01-01">January 1, 2024</time>
      </span>
    </div>
  </header>
  
  <div class="article-content">
    <p>Article content goes here...</p>
    
    <div class="tip-box">
      <strong>Tip:</strong> This is a helpful tip.
    </div>
  </div>
</article>

<!-- Technology tags -->
<div class="tech-stack">
  <span class="tech-tag">JavaScript</span>
  <span class="tech-tag">CSS</span>
  <span class="tech-tag">HTML</span>
</div>

<!-- Buttons -->
<a href="#" class="btn btn-primary">Primary Action</a>
<button class="btn btn-secondary">Secondary Action</button>
```

### Category-Specific Theming

Add category classes to containers for automatic theming:

```html
<!-- Cybersecurity content -->
<div class="content-cybersecurity">
  <article class="article-container">
    <!-- Automatically gets green accent -->
  </article>
</div>

<!-- Music content -->
<div class="content-music">
  <article class="article-container">
    <!-- Automatically gets blue accent -->
  </article>
</div>
```

### Responsive Considerations

All components are designed mobile-first and include responsive adjustments. Use the provided utilities:

```html
<!-- Grid layouts -->
<div class="grid grid-3">
  <!-- 3-column grid that collapses on mobile -->
</div>

<!-- Flex utilities -->
<div class="flex items-center gap-md">
  <!-- Flexbox with utilities -->
</div>
```

## Migration Status

### ✅ Migration Complete

The CSS architecture migration has been completed! All files now use the new modular system:

- **HTML files updated**: All pages now import `main-unified.css` instead of individual CSS files
- **Class names standardized**: Old class names have been replaced with new standardized classes
- **Legacy compatibility removed**: No backward compatibility code remains
- **File structure cleaned**: Old CSS files have been removed

### Current Implementation

All HTML files now use the new system:

```html
<!-- All pages now use -->
<link rel="stylesheet" href="css/main-unified.css">

<!-- Article pages use standardized classes -->
<body class="content-cybersecurity"> <!-- or content-music -->
<article class="article-container">
  <header class="article-header">
    <h1 class="article-title">Title</h1>
    <div class="article-meta">
      <div class="article-meta-item">
        <i class="far fa-calendar-alt"></i>
        <time datetime="2025-01-01">Date</time>
      </div>
    </div>
  </header>
  <div class="article-content">
    <!-- Content -->
  </div>
</article>

<!-- Buttons use standardized classes -->
<a href="#" class="btn btn-primary">Action</a>

<!-- Cards use standardized classes -->
<div class="content-card">
  <div class="card-content">
    <!-- Content -->
  </div>
</div>
```

### Benefits Achieved

✅ **Eliminated duplicate code** - No more duplicate CSS between multiple files  
✅ **Unified naming conventions** - Consistent class names across all components  
✅ **Modular architecture** - Clear separation of foundation, components, and pages  
✅ **Better maintainability** - Easier to update and extend styles  
✅ **Consistent design system** - Unified spacing, colors, and typography  
✅ **Responsive design** - Mobile-first approach with consistent breakpoints  
✅ **Category theming** - Automatic color coordination for different content types

## Maintenance

### Adding New Components

1. Determine the appropriate layer (foundation/components/pages)
2. Use existing design tokens from `variables.css`
3. Follow the established naming conventions
4. Include responsive considerations
5. Document usage in this README

### Modifying Existing Styles

1. Check if changes should be made to variables (affects entire site)
2. Ensure changes maintain responsive behavior
3. Test across different content types and categories
4. Update documentation if needed

### Performance Considerations

- CSS is organized for optimal cascade and specificity
- Import order in `main-new.css` is critical
- Variables are used for all repeated values
- Minimize nesting and specificity conflicts

## Browser Support

- Modern browsers (Chrome, Firefox, Safari, Edge)
- CSS Custom Properties (variables) required
- CSS Grid and Flexbox used throughout
- Graceful degradation for older browsers

## Development Tools

Recommended tools for working with this CSS architecture:

- **VS Code Extensions**: CSS Peek, IntelliSense for CSS class names
- **Browser DevTools**: Chrome/Firefox for testing responsive design
- **CSS Validation**: W3C CSS Validator
- **Performance**: Lighthouse for CSS performance analysis

## Future Enhancements

Planned improvements for the CSS architecture:

1. **Build Process**: Consider adding PostCSS for additional features
2. **Critical CSS**: Extract above-the-fold CSS for better performance  
3. **Component Documentation**: Create a style guide/component library
4. **Dark/Light Mode**: Extend variables system for multiple themes
5. **Animation System**: Standardized animation utilities and keyframes 