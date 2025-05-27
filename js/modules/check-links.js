/**
 * Link checker and fixer for the website
 * This script validates all internal links and can fix navigation between posts
 * 
 * Usage:
 * node check-links.js
 */

const fs = require('fs');
const path = require('path');
const { JSDOM } = require('jsdom');

// Configuration
const config = {
  basePath: '.', // Root directory of website
  blogPath: 'blog', // Blog directory
  portfolioPath: 'portfolio', // Portfolio directory
  dryRun: false // Set to false to actually make changes
};

// Helper functions
function getAllFiles(dirPath, arrayOfFiles = []) {
  const files = fs.readdirSync(dirPath);

  files.forEach(file => {
    const filePath = path.join(dirPath, file);
    
    if (fs.statSync(filePath).isDirectory()) {
      arrayOfFiles = getAllFiles(filePath, arrayOfFiles);
    } else if (path.extname(file) === '.html') {
      arrayOfFiles.push(filePath);
    }
  });

  return arrayOfFiles;
}

function parseHtmlLinks(filePath) {
  const content = fs.readFileSync(filePath, 'utf8');
  const dom = new JSDOM(content);
  const document = dom.window.document;
  
  const links = Array.from(document.querySelectorAll('a'))
    .map(a => ({ 
      href: a.getAttribute('href'),
      text: a.textContent.trim(),
      element: a
    }))
    .filter(link => link.href && !link.href.startsWith('http') && !link.href.startsWith('#') && !link.href.startsWith('mailto:'));
  
  return { dom, document, links, content };
}

// Find all blog posts sorted by date
function getBlogPosts() {
  const blogDir = path.join(config.basePath, config.blogPath);
  if (!fs.existsSync(blogDir)) {
    console.error(`Blog directory ${blogDir} does not exist!`);
    return [];
  }
  
  const posts = [];
  
  fs.readdirSync(blogDir).forEach(file => {
    if (path.extname(file) === '.html' && file !== 'template.html') {
      const filePath = path.join(blogDir, file);
      const content = fs.readFileSync(filePath, 'utf8');
      const dom = new JSDOM(content);
      const document = dom.window.document;
      
      // Extract date from meta tag or time element
      let date = null;
      const timeElement = document.querySelector('time');
      if (timeElement && timeElement.getAttribute('datetime')) {
        date = new Date(timeElement.getAttribute('datetime'));
      }
      
      // Extract title
      let title = '';
      const titleElement = document.querySelector('.blog-header h1');
      if (titleElement) {
        title = titleElement.textContent.trim();
      }
      
      posts.push({
        file,
        path: filePath,
        title,
        date,
        relativePath: path.join(config.blogPath, file)
      });
    }
  });
  
  // Sort by date descending
  return posts.sort((a, b) => {
    if (!a.date) return 1;
    if (!b.date) return -1;
    return b.date - a.date;
  });
}

// Update blog post navigation links
function updateBlogNavigation() {
  console.log('Updating blog post navigation links...');
  
  const posts = getBlogPosts();
  if (posts.length === 0) {
    console.log('No blog posts found.');
    return;
  }
  
  console.log(`Found ${posts.length} blog posts.`);
  
  posts.forEach((post, index) => {
    const prevPost = index < posts.length - 1 ? posts[index + 1] : null;
    const nextPost = index > 0 ? posts[index - 1] : null;
    
    console.log(`Processing: ${post.title}`);
    
    const { dom, document } = parseHtmlLinks(post.path);
    
    // Update previous post link
    const prevLink = document.querySelector('.blog-nav .previous-post');
    if (prevLink) {
      if (prevPost) {
        prevLink.setAttribute('href', `${prevPost.file}`);
        
        // Find the text node or create one
        const iconElement = prevLink.querySelector('i');
        if (iconElement) {
          // Remove all text nodes
          Array.from(prevLink.childNodes).forEach(node => {
            if (node.nodeType === 3) { // Text node
              prevLink.removeChild(node);
            }
          });
          
          // Add new text node after icon
          const textNode = document.createTextNode(` ${prevPost.title}`);
          prevLink.appendChild(textNode);
        } else {
          prevLink.textContent = `← ${prevPost.title}`;
        }
      } else {
        // No previous post
        prevLink.setAttribute('href', '#');
        prevLink.textContent = 'Previous Post';
      }
    }
    
    // Update next post link
    const nextLink = document.querySelector('.blog-nav .next-post');
    if (nextLink) {
      if (nextPost) {
        nextLink.setAttribute('href', `${nextPost.file}`);
        
        // Find or create text node
        const iconElement = nextLink.querySelector('i');
        if (iconElement) {
          // Remove all text nodes
          Array.from(nextLink.childNodes).forEach(node => {
            if (node.nodeType === 3) { // Text node
              nextLink.removeChild(node);
            }
          });
          
          // Add new text node before icon
          const textNode = document.createTextNode(`${nextPost.title} `);
          nextLink.insertBefore(textNode, iconElement);
        } else {
          nextLink.textContent = `${nextPost.title} →`;
        }
      } else {
        // No next post
        nextLink.setAttribute('href', '#');
        nextLink.textContent = 'Next Post';
      }
    }
    
    if (!config.dryRun) {
      fs.writeFileSync(post.path, dom.serialize());
      console.log(`Updated ${post.file}`);
    } else {
      console.log(`Would update ${post.file} (dry run)`);
    }
  });
}

// Check all links in the website
function checkAllLinks() {
  console.log('Checking all internal links...');
  
  const files = getAllFiles(config.basePath);
  console.log(`Found ${files.length} HTML files.`);
  
  let brokenLinks = 0;
  
  files.forEach(file => {
    const { links } = parseHtmlLinks(file);
    
    links.forEach(link => {
      const targetPath = path.resolve(path.dirname(file), link.href);
      
      if (!fs.existsSync(targetPath)) {
        console.error(`[${file}] Broken link: ${link.href} (${link.text})`);
        brokenLinks++;
      }
    });
  });
  
  if (brokenLinks === 0) {
    console.log('No broken links found!');
  } else {
    console.log(`Found ${brokenLinks} broken links.`);
  }
}

// Main function
function main() {
  console.log('Link checker and fixer starting...');
  console.log(`Mode: ${config.dryRun ? 'Dry run (no changes)' : 'Live (making changes)'}`);
  
  updateBlogNavigation();
  checkAllLinks();
  
  console.log('Done!');
}

main(); 