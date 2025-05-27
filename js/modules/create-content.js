/**
 * Helper script to create new blog posts or portfolio projects
 * from templates
 * 
 * Usage:
 * node create-content.js blog "My New Blog Post" "Technology"
 * node create-content.js portfolio "My New Project" "Web Application"
 */

const fs = require('fs');
const path = require('path');
const readline = require('readline');

// Import site configuration
const siteConfig = require('./site-config');

const rl = readline.createInterface({
  input: process.stdin,
  output: process.stdout
});

// Get arguments
const contentType = process.argv[2]?.toLowerCase();
const title = process.argv[3];
const category = process.argv[4];

if (!contentType || !title) {
  console.error('Error: Missing required arguments');
  console.log('Usage: node create-content.js [blog|portfolio] "Title" "Category"');
  process.exit(1);
}

if (contentType !== 'blog' && contentType !== 'portfolio') {
  console.error('Error: Content type must be either "blog" or "portfolio"');
  process.exit(1);
}

// Create filename from title
const filename = title
  .toLowerCase()
  .replace(/[^a-z0-9]+/g, '-')
  .replace(/^-+|-+$/g, '') + '.html';

const destinationPath = path.join(contentType, filename);

// Check if file already exists
if (fs.existsSync(destinationPath)) {
  console.error(`Error: ${destinationPath} already exists`);
  process.exit(1);
}

// Get current date
const today = new Date();
const dateIso = today.toISOString().split('T')[0];
const dateDisplay = today.toLocaleDateString('en-US', {
  year: 'numeric',
  month: 'long',
  day: 'numeric'
});

// Get template path
const templateFile = contentType === 'blog' 
  ? 'templates/blog-post.html' 
  : 'templates/portfolio-project.html';

// Generate navigation items with parent directory
function generateNavItems(withRoot = false) {
  const prefix = withRoot ? '../' : '';
  
  return siteConfig.mainNavigation.map(item => {
    return `<li><a href="${prefix}${item.url}">${item.text}</a></li>`;
  }).join('\n                ');
}

try {
  // Read template file
  let template = fs.readFileSync(templateFile, 'utf8');
  
  // Replace common site config variables
  template = template
    .replace(/{% SITE_NAME %}/g, siteConfig.siteName)
    .replace(/{% SITE_TAGLINE %}/g, siteConfig.tagline)
    .replace(/{% COPYRIGHT_TEXT %}/g, siteConfig.copyrightText)
    .replace(/{% NAV_ITEMS %}/g, generateNavItems())
    .replace(/{% NAV_ITEMS_WITH_ROOT %}/g, generateNavItems(true));
  
  // Replace placeholders based on content type
  if (contentType === 'blog') {
    template = template
      .replace(/{% BLOG_TITLE %}/g, title)
      .replace(/{% DATE_ISO %}/g, dateIso)
      .replace(/{% DATE_DISPLAY %}/g, dateDisplay)
      .replace(/{% BLOG_CATEGORY %}/g, category || 'Uncategorized');
      
    // Add default content
    template = template.replace(/{% BLOG_CONTENT %}/, `
<p>
    Write your introduction paragraph here.
</p>

<h2>First Section</h2>
<p>
    Your content goes here.
</p>

<h3>Subsection</h3>
<p>
    More detailed content here.
</p>

<h2>Conclusion</h2>
<p>
    Summarize your post here.
</p>
`);
  } else {
    // Portfolio replacements
    template = template
      .replace(/{% PROJECT_TITLE %}/g, title)
      .replace(/{% PROJECT_DATE %}/g, dateDisplay)
      .replace(/{% PROJECT_TYPE %}/g, category || 'Web Application')
      .replace(/{% PROJECT_ROLE %}/g, 'Developer');
      
    // Add default gallery
    template = template.replace(/{% PROJECT_GALLERY %}/, `
<div class="gallery-item">
    <img src="../images/project-placeholder-1.jpg" alt="${title} screenshot 1">
</div>
<div class="gallery-item">
    <img src="../images/project-placeholder-2.jpg" alt="${title} screenshot 2">
</div>
`);

    // Add overview
    template = template.replace(/{% PROJECT_OVERVIEW %}/, `
<p>
    Write your project overview here. Explain what this project does, why you created it, and the problem it solves.
</p>
<p>
    Add more details about the background and context of the project.
</p>
`);

    // Add features
    template = template.replace(/{% PROJECT_FEATURES %}/, `
<li>Feature one with detailed explanation</li>
<li>Feature two showing technical implementation</li>
<li>Feature three highlighting user benefits</li>
`);

    // Add tech stack
    template = template.replace(/{% PROJECT_TECH_STACK %}/, `
<span class="tech-tag">HTML5</span>
<span class="tech-tag">CSS3</span>
<span class="tech-tag">JavaScript</span>
`);

    // Add challenges
    template = template.replace(/{% PROJECT_CHALLENGES %}/, `
<p>
    Discuss the major challenges you faced during development and how you overcame them.
</p>
`);

    // Add learning
    template = template.replace(/{% PROJECT_LEARNING %}/, `
<p>
    Share what you learned while working on this project.
</p>
`);
  }
  
  // Write the file
  fs.writeFileSync(destinationPath, template);
  
  console.log(`Successfully created ${destinationPath}`);
  console.log(`Now edit the file to add your content!`);
  
} catch (error) {
  console.error(`Error: ${error.message}`);
  process.exit(1);
}

rl.close(); 