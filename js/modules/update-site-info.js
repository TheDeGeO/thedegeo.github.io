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
const SimpleHTMLParser = require('./html-parser');

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
      const parser = new SimpleHTMLParser(content);
      
      // Extract title, date, and tags
      const titleElement = parser.getElement('.article-title');
      const dateElement = parser.getElement('.article-meta [class*="date"], .article-meta time, .article-meta span i.fa-calendar-alt, .article-meta-item i.fa-calendar-alt');
      const tagsElements = parser.getElements('.article-tags .tag');
      
      // Extract title
      const title = titleElement ? parser.getTextContent(titleElement) : file.replace('.html', '');
      
      // Extract date
      const date = parser.extractDate(dateElement);
      
      // Extract tags
      const tags = tagsElements.map(tag => parser.getTextContent(tag));
      
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
      const parser = new SimpleHTMLParser(content);
      
      // Determine previous and next articles
      const prevArticle = i < categoryArticles.length - 1 ? categoryArticles[i + 1] : null;
      const nextArticle = i > 0 ? categoryArticles[i - 1] : null;
      
      // First, clean up any existing duplicate article footers
      const allFooters = parser.getElements('.article-footer');
      
      // If more than one footer exists, remove all but the first proper <footer> element
      if (allFooters.length > 1) {
        console.log(`  Found ${allFooters.length} article footers in ${article.file}, cleaning up...`);
        
        // Keep only the first footer
        allFooters.slice(1).forEach(footer => {
          parser.replaceContent(footer, '');
        });
      }
      
      // Now find or create the article footer
      let articleFooter = parser.getElement('footer.article-footer');
      
      // If no proper <footer> exists, create one
      if (!articleFooter) {
        // Try to find any remaining div with article-footer class
        const divFooter = parser.getElement('div.article-footer');
        
        if (divFooter) {
          // Replace div with proper footer
          parser.replaceContent(divFooter, divFooter.replace('div', 'footer'));
        } else {
          // Create new footer
          const newFooter = `
            <footer class="article-footer">
              <div class="nav-links">
                <a href="index.html" class="nav-link"><i class="fas fa-arrow-left"></i> Back to ${article.categoryName} Library</a>
                <div class="prev-next-links">
                  ${prevArticle ? `<a href="${prevArticle.url}" class="prev-link"><i class="fas fa-chevron-left"></i> Previous: ${prevArticle.title}</a>` : ''}
                  ${nextArticle ? `<a href="${nextArticle.url}" class="next-link">Next: ${nextArticle.title} <i class="fas fa-chevron-right"></i></a>` : ''}
                </div>
              </div>
            </footer>
          `;
          
          // Add footer to the end of the article content
          const articleContent = parser.getElement('.article-content');
          if (articleContent) {
            parser.replaceContent(articleContent, articleContent + newFooter);
          }
        }
      } else {
        // Update existing footer
        const navLinks = parser.getElement('.nav-links');
        if (navLinks) {
          const newNavLinks = `
            <div class="nav-links">
              <a href="index.html" class="nav-link"><i class="fas fa-arrow-left"></i> Back to ${article.categoryName} Library</a>
              <div class="prev-next-links">
                ${prevArticle ? `<a href="${prevArticle.url}" class="prev-link"><i class="fas fa-chevron-left"></i> Previous: ${prevArticle.title}</a>` : ''}
                ${nextArticle ? `<a href="${nextArticle.url}" class="next-link">Next: ${nextArticle.title} <i class="fas fa-chevron-right"></i></a>` : ''}
              </div>
            </div>
          `;
          parser.replaceContent(navLinks, newNavLinks);
        }
      }
      
      if (!config.dryRun) {
        fs.writeFileSync(article.path, parser.getHTML());
        console.log(`Updated ${article.file}`);
      } else {
        console.log(`Would update ${article.file} (dry run)`);
      }
    }
  });
}

// Update category index pages
function updateCategoryIndexPages(articles) {
  libraryConfig.categories.forEach(category => {
    const indexPath = path.join(config.basePath, category.path, 'index.html');
    if (!fs.existsSync(indexPath)) {
      console.log(`Skipping ${indexPath} - file does not exist`);
      return;
    }
    
    const content = fs.readFileSync(indexPath, 'utf8');
    const parser = new SimpleHTMLParser(content);
    
    // Get articles for this category
    const categoryArticles = articles.filter(a => a.category === category.id);
    
    // Update article count
    const countElement = parser.getElement('.article-meta span');
    if (countElement) {
      parser.replaceContent(countElement, `<span>${categoryArticles.length} articles on ${category.name.toLowerCase()} topics</span>`);
    }
    
    // Update article list
    const articlesList = parser.getElement('#articlesList');
    if (articlesList) {
      const articlesHtml = categoryArticles.map(article => `
        <div class="article-card" data-tags="${article.tags.join(' ')}">
          <h3><a href="${article.url}">${article.title}</a></h3>
          <div class="article-meta">
            <span><i class="far fa-calendar-alt"></i> ${article.date.toLocaleDateString()}</span>
            <span><i class="far fa-clock"></i> ${Math.ceil(Math.random() * 20)} min read</span>
          </div>
          <p>${article.description || ''}</p>
          <div class="article-tags">
            ${article.tags.map(tag => `<span class="tag">${tag}</span>`).join('')}
          </div>
        </div>
      `).join('');
      
      parser.replaceContent(articlesList, `<div id="articlesList">${articlesHtml}</div>`);
    }
    
    if (!config.dryRun) {
      fs.writeFileSync(indexPath, parser.getHTML());
      console.log(`Updated ${indexPath}`);
    } else {
      console.log(`Would update ${indexPath} (dry run)`);
    }
  });
}

// Update main catalog page
function updateMainCatalogPage(articles) {
  const indexPath = path.join(config.basePath, 'catalog', 'index.html');
  if (!fs.existsSync(indexPath)) {
    console.log(`Skipping ${indexPath} - file does not exist`);
    return;
  }
  
  const content = fs.readFileSync(indexPath, 'utf8');
  const parser = new SimpleHTMLParser(content);
  
  // Update category cards
  const catalogGrid = parser.getElement('.catalog-grid');
  if (catalogGrid) {
    const cardsHtml = libraryConfig.categories.map(category => {
      const categoryArticles = articles.filter(a => a.category === category.id);
      return `
        <div class="catalog-card">
          <i class="fas fa-${category.id === 'cybersecurity' ? 'shield-alt' : 'music'} icon"></i>
          <h3>${category.name}</h3>
          <p>${category.description || `Explore articles on ${category.name.toLowerCase()} topics.`}</p>
          <p><strong>Articles:</strong> ${categoryArticles.length}</p>
          <a href="${category.path}/index.html" class="btn btn-primary">Browse Library <i class="fas fa-arrow-right"></i></a>
        </div>
      `;
    }).join('');
    
    parser.replaceContent(catalogGrid, `<div class="catalog-grid">${cardsHtml}</div>`);
  }
  
  if (!config.dryRun) {
    fs.writeFileSync(indexPath, parser.getHTML());
    console.log(`Updated ${indexPath}`);
  } else {
    console.log(`Would update ${indexPath} (dry run)`);
  }
}

// Main function
function main() {
  console.log('Updating site information...');
  console.log(`Mode: ${config.dryRun ? 'Dry run (no changes)' : 'Live (making changes)'}`);
  
  const articles = getAllArticles();
  console.log(`Found ${articles.length} articles across ${libraryConfig.categories.length} categories`);
  
  updateArticleNavigation(articles);
  updateCategoryIndexPages(articles);
  updateMainCatalogPage(articles);
  
  console.log('Done!');
}

main(); 