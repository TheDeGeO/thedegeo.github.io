# Component-Based Architecture

## Overview

This site now uses a component-based architecture to ensure consistency across all pages. The navigation, header, and footer are defined once and automatically loaded on every page.

## 🏗️ **Architecture**

```
components/
├── header.html         # Site header with title and tagline
├── navigation.html     # Main navigation bar
└── footer.html         # Site footer

js/
├── components.js       # Component loading system
└── main.js            # Main site functionality

templates/
├── page-template.html  # New simplified template
├── base.html          # Legacy template (still works)
├── blog-post.html     # Blog post template
└── portfolio-project.html  # Portfolio template
```

## ✅ **Benefits**

1. **Single Source of Truth**: Navigation and footer defined once
2. **Automatic Updates**: Change navigation once, updates everywhere
3. **Consistent Styling**: All pages use identical components
4. **Easy Maintenance**: Add new nav items in one place
5. **Path Intelligence**: Automatically calculates correct link paths

## 🚀 **How It Works**

### Component Loading
```javascript
// Automatically loads components when page loads
const loader = new ComponentLoader();
await loader.initializeComponents();
```

### Page Structure
```html
<body>
    <!-- Components auto-loaded via JavaScript -->
    <div id="site-header"></div>
    <div id="site-navigation"></div>
    
    <main>
        <!-- Your page content here -->
    </main>
    
    <div id="site-footer"></div>
    
    <script src="js/components.js"></script>
    <script src="js/main.js"></script>
</body>
```

## 🔧 **Usage**

### For New Pages

Use the new simplified template (`templates/page-template.html`):

```html
<!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>Page Title - David Obando</title>
    <link rel="stylesheet" href="css/main-unified.css">
    <link rel="stylesheet" href="https://cdnjs.cloudflare.com/ajax/libs/font-awesome/6.4.0/css/all.min.css">
</head>
<body>
    <div id="site-header"></div>
    <div id="site-navigation"></div>
    
    <main>
        <!-- Your content here -->
    </main>
    
    <div id="site-footer"></div>
    
    <script src="js/components.js"></script>
    <script src="js/main.js"></script>
</body>
</html>
```

### Updating Navigation

To add a new navigation item:

1. **Edit once**: `components/navigation.html`
2. **Result**: Updates automatically on all pages

```html
<!-- Add to components/navigation.html -->
<a href="{ROOT_PATH}new-section.html" class="nav-btn">New Section</a>
```

### Path Handling

The system automatically calculates the correct path depth:
- `index.html` → `components/navigation.html`
- `catalog/index.html` → `../components/navigation.html`  
- `catalog/music/page.html` → `../../components/navigation.html`

## 🎯 **Migration Guide**

### Option 1: Gradual Migration
Keep existing pages, use component system for new pages.

### Option 2: Full Migration
Replace existing pages with component-based versions:

1. **Replace navigation section** with `<div id="site-navigation"></div>`
2. **Replace header section** with `<div id="site-header"></div>`
3. **Replace footer section** with `<div id="site-footer"></div>`
4. **Add component scripts** before closing `</body>`

### Example Migration
```html
<!-- BEFORE -->
<nav>
    <div class="nav-buttons">
        <!-- ... navigation HTML ... -->
    </div>
</nav>

<!-- AFTER -->
<div id="site-navigation"></div>
```

## 🛠️ **Advanced Features**

### Custom Events
The component system triggers events when components load:

```javascript
document.addEventListener('componentLoaded', function(event) {
    console.log(`${event.detail.component} loaded into ${event.detail.target}`);
});
```

### Manual Component Loading
```javascript
const loader = new ComponentLoader();
await loader.loadComponent('navigation');
```

### Component Caching
Components are cached after first load for better performance.

## 🔄 **Backward Compatibility**

Existing pages continue to work unchanged. The new system is opt-in and doesn't break existing functionality.

## 📈 **Performance**

- **Caching**: Components cached after first load
- **Parallel Loading**: All components load simultaneously
- **Minimal Overhead**: ~2KB additional JavaScript
- **No External Dependencies**: Pure vanilla JavaScript

## 🎨 **Styling**

Components inherit all existing CSS. No changes needed to current styling system.

## 🐛 **Troubleshooting**

### Components Not Loading
1. Check browser console for errors
2. Verify component files exist in `components/` folder
3. Ensure `js/components.js` loads before other scripts

### Incorrect Paths
The system auto-calculates paths. If links are broken:
1. Check that `{ROOT_PATH}` placeholders are in component files
2. Verify file structure matches expected depth

### JavaScript Errors
1. Ensure `components.js` loads before `main.js`
2. Check that target divs (`#site-header`, etc.) exist in HTML

## 🚀 **Future Enhancements**

- **Template Variables**: Support for dynamic content in components
- **Conditional Components**: Show/hide components based on page type
- **Hot Reloading**: Auto-refresh components during development
- **Build Integration**: Compile-time component injection for static hosting 