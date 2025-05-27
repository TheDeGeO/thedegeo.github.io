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

// Library configuration - add new categories here
const libraryConfig = {
  categories: [
    { 
      id: 'cybersecurity',
      name: 'Cybersecurity',
      path: 'catalog/cybersecurity'
    },
    { 
      id: 'music-theory',
      name: 'Music Theory',
      path: 'catalog/music-theory'
    }
  ]
};

// Helper functions
function getAllHtmlFiles(dirPath, arrayOfFiles = []) {
  const files = fs.readdirSync(dirPath);

  files.forEach(file => {
    const filePath = path.join(dirPath, file);
    
    if (fs.statSync(filePath).isDirectory()) {
      // Skip node_modules and components directories
      if (file === 'node_modules' || file === 'components') {
        return;
      }
      arrayOfFiles = getAllHtmlFiles(filePath, arrayOfFiles);
    } else if (path.extname(file) === '.html') {
      arrayOfFiles.push(filePath);
    }
  });

  return arrayOfFiles;
}

// Get articles for a specific category
function getCategoryArticles(categoryPath) {
  if (!fs.existsSync(categoryPath)) {
    return [];
  }

  const files = fs.readdirSync(categoryPath)
    .filter(file => path.extname(file) === '.html' && file !== 'index.html')
    .map(file => {
      const filePath = path.join(categoryPath, file);
      const content = fs.readFileSync(filePath, 'utf8');
      const dom = new JSDOM(content);
      const document = dom.window.document;
      
      // Extract title, date, and tags
      const titleElement = document.querySelector('.article-title');
      const dateElement = document.querySelector('.article-meta [class*="date"], .article-meta time, .article-meta span i.fa-calendar-alt, .article-meta-item i.fa-calendar-alt');
      const tagsElements = document.querySelectorAll('.article-tags .tag');
      
      // Extract title
      const title = titleElement ? titleElement.textContent.trim() : file.replace('.html', '');
      
      // Extract date - look for either a time element with datetime or text containing a date
      let dateStr = '';
      if (dateElement) {
        if (dateElement.tagName === 'TIME') {
          dateStr = dateElement.getAttribute('datetime');
        } else {
          // Try to find the parent span which might contain the date text
          const parentSpan = dateElement.closest('span');
          if (parentSpan) {
            dateStr = parentSpan.textContent.trim().replace(/[^0-9\-\/]/g, ' ').trim();
          }
        }
      }
      
      // Create a date object from the string, defaulting to now if not found
      const date = dateStr ? new Date(dateStr) : new Date();
      
      // Extract tags
      const tags = [];
      tagsElements.forEach(tag => {
        tags.push(tag.textContent.trim());
      });
      
      return {
        file: file,
        path: filePath,
        title: title,
        date: date,
        tags: tags,
        url: file
      };
    });
  
  // Sort by date, newest first
  files.sort((a, b) => b.date - a.date);
  
  return files;
}

// Get all articles across all categories
function getAllArticles() {
  let allArticles = [];
  
  libraryConfig.categories.forEach(category => {
    const categoryPath = path.join(config.basePath, category.path);
    const articles = getCategoryArticles(categoryPath);
    
    articles.forEach(article => {
      allArticles.push({
        ...article,
        category: category.id,
        categoryName: category.name,
        categoryPath: category.path
      });
    });
  });
  
  return allArticles;
}

// Update article navigation (prev/next)
function updateArticleNavigation(articles) {
  // Group articles by category
  const articlesByCategory = {};
  
  articles.forEach(article => {
    if (!articlesByCategory[article.category]) {
      articlesByCategory[article.category] = [];
    }
    articlesByCategory[article.category].push(article);
  });
  
  // For each category, update the navigation
  Object.keys(articlesByCategory).forEach(categoryId => {
    const categoryArticles = articlesByCategory[categoryId];
    
    for (let i = 0; i < categoryArticles.length; i++) {
      const article = categoryArticles[i];
      const content = fs.readFileSync(article.path, 'utf8');
      const dom = new JSDOM(content);
      const document = dom.window.document;
      
      // Determine previous and next articles
      const prevArticle = i < categoryArticles.length - 1 ? categoryArticles[i + 1] : null;
      const nextArticle = i > 0 ? categoryArticles[i - 1] : null;
      
      // First, clean up any existing duplicate article footers
      const allFooters = document.querySelectorAll('.article-footer');
      
      // If more than one footer exists, remove all but the first proper <footer> element
      if (allFooters.length > 1) {
        console.log(`  Found ${allFooters.length} article footers in ${article.file}, cleaning up...`);
        
        // Find the first proper <footer> element
        let foundProperFooter = false;
        
        allFooters.forEach(footer => {
          // If this is a proper <footer> element and we haven't found one yet, keep it
          if (footer.tagName === 'FOOTER' && !foundProperFooter) {
            foundProperFooter = true;
          } else {
            // Otherwise, remove this footer
            if (footer.parentNode) {
              footer.parentNode.removeChild(footer);
            }
          }
        });
      }
      
      // Now find or create the article footer (after cleanup)
      let articleFooter = document.querySelector('footer.article-footer');
      
      // If no proper <footer> exists, create one
      if (!articleFooter) {
        // Try to find any remaining div with article-footer class
        const divFooter = document.querySelector('div.article-footer');
        
        // If a div footer exists, replace it with a proper footer
        if (divFooter && divFooter.parentNode) {
          articleFooter = document.createElement('footer');
          articleFooter.className = 'article-footer';
          
          // Move any existing content except nav-links
          while (divFooter.firstChild) {
            if (!divFooter.firstChild.classList || !divFooter.firstChild.classList.contains('nav-links')) {
              articleFooter.appendChild(divFooter.firstChild);
            } else {
              divFooter.removeChild(divFooter.firstChild);
            }
          }
          
          // Replace the div with the footer
          divFooter.parentNode.replaceChild(articleFooter, divFooter);
          console.log(`  Replaced div.article-footer with proper footer.article-footer in ${article.file}`);
        } else {
          // Create footer if none exists at all
          const articleContent = document.querySelector('.article-content');
          if (articleContent) {
            articleFooter = document.createElement('footer');
            articleFooter.className = 'article-footer';
            articleContent.appendChild(articleFooter);
            console.log(`  Created new footer.article-footer in ${article.file}`);
          }
        }
      }
      
      if (articleFooter) {
        // Find or create nav links container
        let navLinks = articleFooter.querySelector('.nav-links');
        if (!navLinks) {
          navLinks = document.createElement('div');
          navLinks.className = 'nav-links';
          articleFooter.appendChild(navLinks);
        }
        
        // Store the original HTML for comparison later
        const originalHTML = articleFooter.innerHTML;
        
        // Clear existing navigation links
        navLinks.innerHTML = '';
        
        // Add back to library link
        const backLink = document.createElement('a');
        backLink.href = 'index.html';
        backLink.className = 'nav-link';
        backLink.innerHTML = `<i class="fas fa-arrow-left"></i> Back to ${articles.find(a => a.category === categoryId).categoryName} Library`;
        navLinks.appendChild(backLink);
        
        // Add previous/next links if needed
        if (prevArticle || nextArticle) {
          const prevNextContainer = document.createElement('div');
          prevNextContainer.className = 'prev-next-links';
          
          if (prevArticle) {
            const prevLink = document.createElement('a');
            prevLink.href = prevArticle.url;
            prevLink.className = 'prev-link';
            prevLink.innerHTML = `<i class="fas fa-chevron-left"></i> Previous: ${prevArticle.title}`;
            prevNextContainer.appendChild(prevLink);
          }
          
          if (nextArticle) {
            const nextLink = document.createElement('a');
            nextLink.href = nextArticle.url;
            nextLink.className = 'next-link';
            nextLink.innerHTML = `Next: ${nextArticle.title} <i class="fas fa-chevron-right"></i>`;
            prevNextContainer.appendChild(nextLink);
          }
          
          navLinks.appendChild(prevNextContainer);
        }
        
        // Check if the HTML actually changed
        const newHTML = articleFooter.innerHTML;
        const htmlChanged = originalHTML !== newHTML;
        
        // Write the changes only if something actually changed
        if (!config.dryRun && htmlChanged) {
          fs.writeFileSync(article.path, dom.serialize());
          console.log(`  Updated article navigation for ${article.file}`);
        } else if (config.dryRun && htmlChanged) {
          console.log(`  Would update article navigation for ${article.file} (dry run)`);
        } else {
          // No changes needed
          console.log(`  Article navigation already up-to-date for ${article.file}`);
        }
      }
    }
  });
}

// Update category index pages with article counts
function updateCategoryIndexPages(articles) {
  libraryConfig.categories.forEach(category => {
    const categoryPath = path.join(config.basePath, category.path);
    const indexPath = path.join(categoryPath, 'index.html');
    
    // Skip if index page doesn't exist
    if (!fs.existsSync(indexPath)) {
      console.log(`  Category index page not found: ${indexPath}`);
      return;
    }
    
    // Get articles for this category
    const categoryArticles = articles.filter(article => article.category === category.id);
    
    // Update the index page
    const content = fs.readFileSync(indexPath, 'utf8');
    const dom = new JSDOM(content);
    const document = dom.window.document;
    
    // Update article count in meta section if it exists
    const articleMeta = document.querySelector('.article-meta span');
    if (articleMeta) {
      articleMeta.textContent = `${categoryArticles.length} article${categoryArticles.length !== 1 ? 's' : ''} on ${category.name.toLowerCase()} topics`;
      console.log(`  Updated article count in ${indexPath}: ${categoryArticles.length} articles`);
    }
    
    // Write the changes
    if (!config.dryRun) {
      fs.writeFileSync(indexPath, dom.serialize());
      console.log(`  Updated category index page: ${indexPath}`);
    } else {
      console.log(`  Would update category index page: ${indexPath} (dry run)`);
    }
  });
}

// Update main catalog page with article counts
function updateMainCatalogPage(articles) {
  const catalogPath = path.join(config.basePath, 'catalog/index.html');
  
  // Skip if catalog page doesn't exist
  if (!fs.existsSync(catalogPath)) {
    console.log(`  Main catalog page not found: ${catalogPath}`);
    return;
  }
  
  // Update the catalog page
  const content = fs.readFileSync(catalogPath, 'utf8');
  const dom = new JSDOM(content);
  const document = dom.window.document;
  
  // Find all catalog cards
  const catalogCards = document.querySelectorAll('.catalog-card');
  
  catalogCards.forEach(card => {
    // Find the category heading
    const heading = card.querySelector('h3');
    if (!heading) return;
    
    // Find the category
    const categoryName = heading.textContent.trim();
    const category = libraryConfig.categories.find(c => c.name.toLowerCase() === categoryName.toLowerCase());
    
    if (category) {
      // Count articles for this category
      const categoryArticles = articles.filter(article => article.category === category.id);
      
      // Find the articles count paragraph
      let countParagraph = Array.from(card.querySelectorAll('p')).find(p => 
        p.textContent.includes('Articles:')
      );
      
      // Create it if it doesn't exist
      if (!countParagraph) {
        countParagraph = document.createElement('p');
        card.insertBefore(countParagraph, card.querySelector('a'));
      }
      
      // Update the count
      countParagraph.innerHTML = `<strong>Articles:</strong> ${categoryArticles.length}`;
      console.log(`  Updated article count for ${categoryName}: ${categoryArticles.length} articles`);
    }
  });
  
  // Write the changes
  if (!config.dryRun) {
    fs.writeFileSync(catalogPath, dom.serialize());
    console.log(`  Updated main catalog page: ${catalogPath}`);
  } else {
    console.log(`  Would update main catalog page: ${catalogPath} (dry run)`);
  }
}

// Generate navigation items for a specific file
function generateNavItems(filePath) {
  // Determine if the file is in a subdirectory and how deep
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

// Update all HTML files with consistent site info
function updateHtmlFile(filePath) {
  console.log(`Processing: ${filePath}`);
  
  try {
    const content = fs.readFileSync(filePath, 'utf8');
    const dom = new JSDOM(content);
    const document = dom.window.document;
    
    // Update page title if needed
    const pageTitle = document.querySelector('title');
    if (pageTitle) {
      const pageTitleText = pageTitle.textContent;
      if (pageTitleText.includes(' - ')) {
        // Keep the main title, update only the site name part
        const mainTitle = pageTitleText.split(' - ')[0];
        if (pageTitleText !== `${mainTitle} - ${siteConfig.siteName}`) {
          pageTitle.textContent = `${mainTitle} - ${siteConfig.siteName}`;
          console.log(`  Updated page title to: ${pageTitle.textContent}`);
        }
      } else if (pageTitleText !== siteConfig.siteTitle) {
        // If there's no separator, this might be the home page
        pageTitle.textContent = siteConfig.siteTitle;
        console.log(`  Updated page title to: ${pageTitle.textContent}`);
      }
    }
    
    // Update meta description if it exists
    const metaDescription = document.querySelector('meta[name="description"]');
    if (metaDescription && metaDescription.getAttribute('content') !== siteConfig.siteDescription) {
      metaDescription.setAttribute('content', siteConfig.siteDescription);
      console.log(`  Updated meta description`);
    }
    
    // Update site header if it exists via component loading
    // Note: This is handled by components.js, we just ensure the container exists
    
    // Update site navigation if it exists via component loading
    // Note: This is handled by components.js, we just ensure the container exists
    
    // Ensure viewport meta tag exists
    let viewportMeta = document.querySelector('meta[name="viewport"]');
    if (!viewportMeta) {
      const head = document.querySelector('head');
      if (head) {
        viewportMeta = document.createElement('meta');
        viewportMeta.setAttribute('name', 'viewport');
        viewportMeta.setAttribute('content', 'width=device-width, initial-scale=1.0, maximum-scale=5.0');
        head.insertBefore(viewportMeta, head.firstChild.nextSibling); // After charset
        console.log(`  Added viewport meta tag`);
      }
    }
    
    // Ensure main CSS files are loaded
    let mainCss = Array.from(document.querySelectorAll('link')).find(link => 
      link.getAttribute('href').includes('main-unified.css')
    );
    
    let fontsCss = Array.from(document.querySelectorAll('link')).find(link => 
      link.getAttribute('href').includes('fonts.css')
    );
    
    if (!mainCss || !fontsCss) {
      const head = document.querySelector('head');
      if (head) {
        const relativeToRoot = path.relative(path.dirname(filePath), config.basePath);
        const prefix = relativeToRoot !== '' ? relativeToRoot + '/' : '';
        
        if (!mainCss) {
          mainCss = document.createElement('link');
          mainCss.setAttribute('rel', 'stylesheet');
          mainCss.setAttribute('href', `${prefix}css/main-unified.css`);
          head.appendChild(mainCss);
          console.log(`  Added main CSS link`);
        }
        
        if (!fontsCss) {
          fontsCss = document.createElement('link');
          fontsCss.setAttribute('rel', 'stylesheet');
          fontsCss.setAttribute('href', `${prefix}css/fonts.css`);
          head.appendChild(fontsCss);
          console.log(`  Added fonts CSS link`);
        }
      }
    }
    
    // Ensure correct script ordering in all pages
    // First check if we need to update script paths to use the modules directory
    const scripts = document.querySelectorAll('script');
    const scriptSources = Array.from(scripts).map(script => script.getAttribute('src')).filter(Boolean);
    
    // Determine relative path to root for scripts
    const relativeToRoot = path.relative(path.dirname(filePath), config.basePath);
    const prefix = relativeToRoot !== '' ? relativeToRoot + '/' : '';
    
    let needsScriptUpdates = false;
    
    // Check if any scripts need updating to modules path
    scriptSources.forEach(src => {
      if (src && src.includes('js/') && !src.includes('js/modules/') && !src.includes('js/main.js')) {
        needsScriptUpdates = true;
      }
    });
    
    if (needsScriptUpdates) {
      console.log(`  Updating script paths to use modules directory`);
      
      // First remove all scripts except external ones
      scripts.forEach(script => {
        const src = script.getAttribute('src');
        if (src && !src.startsWith('http') && !src.startsWith('//')) {
          script.parentNode.removeChild(script);
        }
      });
      
      // Add the scripts in the correct order
      const body = document.querySelector('body');
      
      // First add components.js
      const componentsScript = document.createElement('script');
      componentsScript.setAttribute('src', `${prefix}js/modules/components.js`);
      body.appendChild(componentsScript);
      
      // Then add main.js
      const mainScript = document.createElement('script');
      mainScript.setAttribute('src', `${prefix}js/main.js`);
      body.appendChild(mainScript);
      
      // Look for category-specific scripts that should be added
      if (filePath.includes('cybersecurity')) {
        const cybersecurityScript = document.createElement('script');
        cybersecurityScript.setAttribute('src', `${prefix}js/modules/cybersecurity-library.js`);
        body.appendChild(cybersecurityScript);
      } else if (filePath.includes('music-theory')) {
        const musicTheoryScript = document.createElement('script');
        musicTheoryScript.setAttribute('src', `${prefix}js/modules/music-theory-library.js`);
        body.appendChild(musicTheoryScript);
      }
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
  
  // Get all articles
  console.log('Collecting all articles...');
  const allArticles = getAllArticles();
  console.log(`Found ${allArticles.length} articles across all categories.`);
  
  // First update category pages with article counts
  console.log('Updating category index pages with article counts...');
  updateCategoryIndexPages(allArticles);
  
  // Update main catalog page with article counts
  console.log('Updating main catalog page with article counts...');
  updateMainCatalogPage(allArticles);
  
  // Update article navigation (prev/next links)
  console.log('Updating article navigation (prev/next links)...');
  updateArticleNavigation(allArticles);
  
  // Get all HTML files
  const htmlFiles = getAllHtmlFiles(config.basePath);
  console.log(`Found ${htmlFiles.length} HTML files.`);
  
  // Update all HTML files with consistent site info
  console.log('Updating all HTML files with consistent site info...');
  htmlFiles.forEach(file => {
    updateHtmlFile(file);
  });
  
  console.log('Done!');
}

main(); 