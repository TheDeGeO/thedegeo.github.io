/**
 * Update Site Info
 * 
 * This script updates all HTML files with the latest site configuration settings
 * Run this when you change anything in site-config.js to propagate changes to all pages
 * 
 * Usage:
 * node update-site-info.js
 */

const fs = require('fs');
const path = require('path');
const { JSDOM } = require('jsdom');

// Import site configuration
const siteConfig = require('./site-config');

// Configuration
const config = {
  basePath: '.',
  dryRun: false // Set to true to see what would change without making changes
};

// Helper functions
function getAllHtmlFiles(dirPath, arrayOfFiles = []) {
  const files = fs.readdirSync(dirPath);

  files.forEach(file => {
    const filePath = path.join(dirPath, file);
    
    if (fs.statSync(filePath).isDirectory()) {
      arrayOfFiles = getAllHtmlFiles(filePath, arrayOfFiles);
    } else if (path.extname(file) === '.html') {
      arrayOfFiles.push(filePath);
    }
  });

  return arrayOfFiles;
}

// Get all blog posts and their metadata
function getAllBlogPosts() {
  const blogDir = path.join(config.basePath, 'blog');
  if (!fs.existsSync(blogDir)) {
    return [];
  }

  const blogFiles = fs.readdirSync(blogDir)
    .filter(file => path.extname(file) === '.html' && file !== 'template.html')
    .map(file => {
      const filePath = path.join(blogDir, file);
      const content = fs.readFileSync(filePath, 'utf8');
      const dom = new JSDOM(content);
      const document = dom.window.document;
      
      // Extract title and date
      const titleElement = document.querySelector('.blog-header h1');
      const dateElement = document.querySelector('.blog-meta time');
      
      const title = titleElement ? titleElement.textContent.trim() : file.replace('.html', '');
      const dateStr = dateElement ? dateElement.getAttribute('datetime') : '';
      const date = dateStr ? new Date(dateStr) : new Date(0); // Default to epoch if no date
      
      return {
        file: file,
        path: filePath,
        title: title,
        date: date,
        url: `blog/${file}`
      };
    });
  
  // Sort by date, newest first
  blogFiles.sort((a, b) => b.date - a.date);
  
  return blogFiles;
}

// Generate navigation items for a specific file
function generateNavItems(filePath) {
  // Determine if the file is in a subdirectory
  const relativeToRoot = path.relative(path.dirname(filePath), config.basePath);
  const isInSubdir = relativeToRoot !== '';
  const prefix = isInSubdir ? relativeToRoot + '/' : '';
  
  // Create home button first
  let navHtml = `<li class="home-button"><a href="${prefix}index.html"><i class="fas fa-home"></i> Home</a></li>\n`;
  
  // Add the rest of the navigation items
  navHtml += siteConfig.mainNavigation.map(item => {
    return `<li><a href="${prefix}${item.url}">${item.text}</a></li>`;
  }).join('\n');
  
  return navHtml;
}

// Update blog post navigation links (prev/next)
function updateBlogPostNavigation(blogPosts) {
  for (let i = 0; i < blogPosts.length; i++) {
    const post = blogPosts[i];
    const content = fs.readFileSync(post.path, 'utf8');
    const dom = new JSDOM(content);
    const document = dom.window.document;
    
    // Find the blog navigation section
    const blogNav = document.querySelector('.blog-nav');
    if (!blogNav) continue;
    
    // Determine previous and next posts
    const prevPost = i < blogPosts.length - 1 ? blogPosts[i + 1] : null;
    const nextPost = i > 0 ? blogPosts[i - 1] : null;
    
    // Update navigation links
    const prevLink = blogNav.querySelector('.previous-post');
    const nextLink = blogNav.querySelector('.next-post');
    
    if (prevLink) {
      if (prevPost) {
        prevLink.setAttribute('href', `${prevPost.file}`);
        prevLink.innerHTML = `<i class="fas fa-arrow-left"></i> ${prevPost.title}`;
      } else {
        prevLink.style.visibility = 'hidden';
      }
    }
    
    if (nextLink) {
      if (nextPost) {
        nextLink.setAttribute('href', `${nextPost.file}`);
        nextLink.innerHTML = `${nextPost.title} <i class="fas fa-arrow-right"></i>`;
      } else {
        nextLink.style.visibility = 'hidden';
      }
    }
    
    // Write the changes
    if (!config.dryRun) {
      fs.writeFileSync(post.path, dom.serialize());
      console.log(`  Updated blog navigation for ${post.file}`);
    } else {
      console.log(`  Would update blog navigation for ${post.file} (dry run)`);
    }
  }
}

// Replace template placeholders in blog posts
function processBlogTemplates(blogPosts) {
  for (let i = 0; i < blogPosts.length; i++) {
    const post = blogPosts[i];
    const content = fs.readFileSync(post.path, 'utf8');
    
    // Check if it contains template placeholders
    if (content.includes('{% PREV_POST %}') || content.includes('{% NEXT_POST %}')) {
      console.log(`  Processing template placeholders for ${post.file}`);
      
      // Get previous and next posts
      const prevPost = i < blogPosts.length - 1 ? blogPosts[i + 1] : null;
      const nextPost = i > 0 ? blogPosts[i - 1] : null;
      
      // Replace placeholders
      let updatedContent = content;
      
      // Replace previous post placeholders
      if (prevPost) {
        updatedContent = updatedContent
          .replace(/{% if PREV_POST %}([\s\S]*?){% else %}[\s\S]*?{% endif %}/g, '$1')
          .replace(/{% PREV_POST_LINK %}/g, prevPost.file)
          .replace(/{% PREV_POST_TITLE %}/g, prevPost.title);
      } else {
        updatedContent = updatedContent
          .replace(/{% if PREV_POST %}[\s\S]*?{% else %}([\s\S]*?){% endif %}/g, '$1')
          .replace(/<a href="{% PREV_POST_LINK %}" class="previous-post">[\s\S]*?<\/a>/g, '<span></span>');
      }
      
      // Replace next post placeholders
      if (nextPost) {
        updatedContent = updatedContent
          .replace(/{% if NEXT_POST %}([\s\S]*?){% else %}[\s\S]*?{% endif %}/g, '$1')
          .replace(/{% NEXT_POST_LINK %}/g, nextPost.file)
          .replace(/{% NEXT_POST_TITLE %}/g, nextPost.title);
      } else {
        updatedContent = updatedContent
          .replace(/{% if NEXT_POST %}[\s\S]*?{% else %}([\s\S]*?){% endif %}/g, '$1')
          .replace(/<a href="{% NEXT_POST_LINK %}" class="next-post">[\s\S]*?<\/a>/g, '<span></span>');
      }
      
      // Write changes
      if (!config.dryRun) {
        fs.writeFileSync(post.path, updatedContent);
        console.log(`  Updated template placeholders for ${post.file}`);
      } else {
        console.log(`  Would update template placeholders for ${post.file} (dry run)`);
      }
    }
  }
}

function updateHtmlFile(filePath) {
  console.log(`Processing: ${filePath}`);
  
  try {
    const content = fs.readFileSync(filePath, 'utf8');
    const dom = new JSDOM(content);
    const document = dom.window.document;
    
    // Update site name in header
    const headerTitle = document.querySelector('header h1');
    if (headerTitle) {
      if (headerTitle.textContent !== siteConfig.siteName) {
        console.log(`  Updating header title: "${headerTitle.textContent}" -> "${siteConfig.siteName}"`);
        headerTitle.textContent = siteConfig.siteName;
      }
    }
    
    // Update tagline
    const tagline = document.querySelector('.tagline');
    if (tagline) {
      if (tagline.textContent !== siteConfig.tagline) {
        console.log(`  Updating tagline`);
        tagline.textContent = siteConfig.tagline;
      }
    }
    
    // Update navigation
    const navUl = document.querySelector('nav ul');
    if (navUl) {
      console.log(`  Updating navigation`);
      navUl.innerHTML = generateNavItems(filePath);
    }
    
    // Add the menu toggle button if it doesn't exist
    const menuToggle = document.querySelector('.menu-toggle');
    const navContainer = document.querySelector('nav .container');
    if (navContainer && !menuToggle) {
      console.log(`  Adding hamburger menu toggle`);
      const button = document.createElement('button');
      button.className = 'menu-toggle';
      button.setAttribute('aria-label', 'Toggle navigation menu');
      
      const icon = document.createElement('i');
      icon.className = 'fas fa-bars';
      
      button.appendChild(icon);
      navContainer.insertBefore(button, navContainer.firstChild);
    }
    
    // Ensure header has site-header class for the JS toggling
    const header = document.querySelector('header');
    if (header && !header.classList.contains('site-header')) {
      header.classList.add('site-header');
      console.log(`  Adding site-header class to header`);
    }
    
    // Check if the toggle script exists, add it if not
    const toggleScript = Array.from(document.querySelectorAll('script')).find(script => 
      script.textContent.includes('isHomePage') && script.textContent.includes('site-header')
    );
    
    if (!toggleScript) {
      console.log(`  Adding header toggle script`);
      const scriptElement = document.createElement('script');
      scriptElement.textContent = `
        document.addEventListener('DOMContentLoaded', function() {
            // Check if this is the home page
            const isHomePage = window.location.pathname.endsWith('index.html') || 
                               window.location.pathname.endsWith('/') ||
                               window.location.pathname === '';
            
            // Get the header element
            const header = document.querySelector('.site-header');
            
            // Hide header if not on home page
            if (!isHomePage) {
                header.style.display = 'none';
            }
            
            // Mobile menu toggle
            const menuToggle = document.querySelector('.menu-toggle');
            const navMenu = document.querySelector('nav ul');
            
            if (menuToggle) {
                menuToggle.addEventListener('click', function() {
                    navMenu.classList.toggle('active');
                    // Change icon based on menu state
                    const icon = this.querySelector('i');
                    if (navMenu.classList.contains('active')) {
                        icon.classList.remove('fa-bars');
                        icon.classList.add('fa-times');
                    } else {
                        icon.classList.remove('fa-times');
                        icon.classList.add('fa-bars');
                    }
                });
                
                // Close menu when clicking on a link
                const navLinks = document.querySelectorAll('nav ul li a');
                navLinks.forEach(link => {
                    link.addEventListener('click', function() {
                        navMenu.classList.remove('active');
                        const icon = menuToggle.querySelector('i');
                        icon.classList.remove('fa-times');
                        icon.classList.add('fa-bars');
                    });
                });
            }
        });
      `;
      document.body.appendChild(scriptElement);
    }
    
    // Update page title
    const pageTitle = document.querySelector('title');
    if (pageTitle && pageTitle.textContent.includes(' - ')) {
      const mainTitle = pageTitle.textContent.split(' - ')[0];
      pageTitle.textContent = `${mainTitle} - ${siteConfig.siteName}`;
      console.log(`  Updating page title`);
    }
    
    // Update footer copyright
    const copyright = document.querySelector('footer p');
    if (copyright) {
      // Preserve the dynamic year script
      const scriptTag = copyright.querySelector('script');
      let scriptHtml = '';
      if (scriptTag) {
        scriptHtml = scriptTag.outerHTML;
      }
      
      copyright.innerHTML = `&copy; ${scriptHtml} ${siteConfig.siteName}. ${siteConfig.copyrightText}`;
      console.log(`  Updating copyright`);
    }
    
    // Write the changes
    if (!config.dryRun) {
      fs.writeFileSync(filePath, dom.serialize());
      console.log(`  Updated ${filePath}`);
    } else {
      console.log(`  Would update ${filePath} (dry run)`);
    }
    
  } catch (error) {
    console.error(`  Error processing ${filePath}: ${error.message}`);
  }
}

// Main function
function main() {
  console.log('Updating site information across all HTML files...');
  console.log(`Mode: ${config.dryRun ? 'Dry run (no changes)' : 'Live (making changes)'}`);
  
  const htmlFiles = getAllHtmlFiles(config.basePath);
  console.log(`Found ${htmlFiles.length} HTML files.`);
  
  // First process all blog posts and set up prev/next navigation
  console.log('Processing blog posts for navigation links...');
  const blogPosts = getAllBlogPosts();
  console.log(`Found ${blogPosts.length} blog posts.`);
  
  // Process templates and update navigation
  processBlogTemplates(blogPosts);
  updateBlogPostNavigation(blogPosts);
  
  // Then update all HTML files
  htmlFiles.forEach(file => {
    updateHtmlFile(file);
  });
  
  console.log('Done!');
}

main(); 