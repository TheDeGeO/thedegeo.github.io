/**
 * Link checker and fixer for the website
 * This script validates all internal links and can fix navigation between posts
 * 
 * Usage:
 * node check-links.js
 */

const fs = require('fs');
const path = require('path');
const SimpleHTMLParser = require('./html-parser');

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
  const parser = new SimpleHTMLParser(content);
  const links = parser.getLinks()
    .filter(link => link.href && !link.href.startsWith('http') && !link.href.startsWith('#') && !link.href.startsWith('mailto:'));
  
  return { parser, links, content };
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
      const parser = new SimpleHTMLParser(content);
      
      // Extract date from meta tag or time element
      const timeElement = parser.getElement('time');
      const date = parser.extractDate(timeElement);
      
      // Extract title
      const titleElement = parser.getElement('.blog-header h1');
      const title = titleElement ? parser.getTextContent(titleElement) : file.replace('.html', '');
      
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
    
    const { parser } = parseHtmlLinks(post.path);
    
    // Update previous post link
    const prevLink = parser.getElement('.blog-nav .previous-post');
    if (prevLink) {
      if (prevPost) {
        const newPrevLink = prevLink.replace(/href=["'][^"']*["']/, `href="${prevPost.file}"`);
        const iconElement = newPrevLink.match(/<i[^>]*>.*?<\/i>/);
        if (iconElement) {
          const newContent = newPrevLink.replace(iconElement[0], `${iconElement[0]} ${prevPost.title}`);
          parser.replaceContent(prevLink, newContent);
        } else {
          parser.replaceContent(prevLink, `<a href="${prevPost.file}" class="previous-post">← ${prevPost.title}</a>`);
        }
      } else {
        parser.replaceContent(prevLink, '<a href="#" class="previous-post">Previous Post</a>');
      }
    }
    
    // Update next post link
    const nextLink = parser.getElement('.blog-nav .next-post');
    if (nextLink) {
      if (nextPost) {
        const newNextLink = nextLink.replace(/href=["'][^"']*["']/, `href="${nextPost.file}"`);
        const iconElement = newNextLink.match(/<i[^>]*>.*?<\/i>/);
        if (iconElement) {
          const newContent = newNextLink.replace(iconElement[0], `${nextPost.title} ${iconElement[0]}`);
          parser.replaceContent(nextLink, newContent);
        } else {
          parser.replaceContent(nextLink, `<a href="${nextPost.file}" class="next-post">${nextPost.title} →</a>`);
        }
      } else {
        parser.replaceContent(nextLink, '<a href="#" class="next-post">Next Post</a>');
      }
    }
    
    if (!config.dryRun) {
      fs.writeFileSync(post.path, parser.getHTML());
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
      const targetPath = path.join(path.dirname(file), link.href);
      if (!fs.existsSync(targetPath)) {
        console.error(`Broken link in ${file}: ${link.href} (${link.text})`);
        brokenLinks++;
      }
    });
  });
  
  if (brokenLinks === 0) {
    console.log('All links are valid!');
  } else {
    console.error(`Found ${brokenLinks} broken links.`);
  }
}

// Main function
function main() {
  const args = process.argv.slice(2);
  const command = args[0] || 'check';
  
  switch (command) {
    case 'check':
      checkAllLinks();
      break;
    case 'update':
  updateBlogNavigation();
      break;
    default:
      console.error(`Unknown command: ${command}`);
      console.log('Available commands: check, update');
      process.exit(1);
  }
}

main(); 