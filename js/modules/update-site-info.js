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

// Helper: Load HTML file and return DOM/document
function loadDom(filePath) {
  const html = fs.readFileSync(filePath, 'utf8');
  return new JSDOM(html);
}

// Helper: Save DOM/document to file
function saveDom(dom, filePath) {
  fs.writeFileSync(filePath, dom.serialize());
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
      const html = fs.readFileSync(filePath, 'utf8');
      const dom = new JSDOM(html);
      const document = dom.window.document;
      // Extract title
      const titleElement = document.querySelector('.article-title');
      const title = titleElement ? titleElement.textContent.trim() : file.replace('.html', '');
      // Extract date robustly
      let date = null;
      const timeElement = document.querySelector('.article-meta time');
      function isValidDate(d) {
        return d instanceof Date && !isNaN(d.getTime());
      }
      if (timeElement) {
        let dateString = timeElement.dateTime || timeElement.getAttribute('datetime');
        if (dateString && isValidDate(new Date(dateString))) {
          date = new Date(dateString);
        } else {
          // Fallback: try to parse text content
          const text = timeElement.textContent;
          const dateMatch = text.match(/\d{4}-\d{2}-\d{2}|\d{2}\/\d{2}\/\d{4}/);
          if (dateMatch && isValidDate(new Date(dateMatch[0]))) {
            date = new Date(dateMatch[0]);
          }
        }
      } else {
        // Fallback: old logic for legacy articles
        const dateElement = document.querySelector('.article-meta [class*="date"], .article-meta span i.fa-calendar-alt, .article-meta-item i.fa-calendar-alt');
        if (dateElement) {
          const text = dateElement.textContent;
          const dateMatch = text.match(/\d{4}-\d{2}-\d{2}|\d{2}\/\d{2}\/\d{4}/);
          if (dateMatch && isValidDate(new Date(dateMatch[0]))) {
            date = new Date(dateMatch[0]);
          }
        }
      }
      // Extract reading time
      let readingTime = 5; // Default value
      const readingTimeElement = document.querySelector('.article-meta-item i.fa-clock')?.parentElement?.querySelector('span');
      if (readingTimeElement) {
        const match = readingTimeElement.textContent.match(/(\d+)\s*min read/);
        if (match) {
          readingTime = parseInt(match[1], 10);
        }
      }
      // Extract tags
      const tagsElements = document.querySelectorAll('.article-tags .tag');
      const tags = Array.from(tagsElements).map(tag => tag.textContent.trim());
      // Extract description
      let description = '';
      const descElement = document.querySelector('.article-description');
      if (descElement) {
        description = descElement.textContent.trim();
      } else {
        // Fallback: .article-summary, meta, or first <p> in .article-content
        const summaryElement = document.querySelector('.article-summary, meta[name="description"]');
        if (summaryElement) {
          description = summaryElement.textContent || summaryElement.getAttribute('content') || '';
        } else {
          const firstP = document.querySelector('.article-content p');
          if (firstP) {
            description = firstP.textContent.trim();
          }
        }
      }
      return {
        file: file,
        path: filePath,
        title: title,
        date: date,
        tags: tags,
        url: file,
        description: description,
        readingTime: readingTime
      };
    });
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
  const articlesByCategory = {};
  articles.forEach(article => {
    if (!articlesByCategory[article.category]) articlesByCategory[article.category] = [];
    articlesByCategory[article.category].push(article);
  });
  Object.keys(articlesByCategory).forEach(categoryId => {
    const categoryArticles = articlesByCategory[categoryId];
    for (let i = 0; i < categoryArticles.length; i++) {
      const article = categoryArticles[i];
      const dom = loadDom(article.path);
      const document = dom.window.document;
      // Remove all but the first .article-footer
      const footers = document.querySelectorAll('.article-footer');
      if (footers.length > 1) {
        for (let j = 1; j < footers.length; j++) footers[j].remove();
      }
      // Find or create footer
      let footer = document.querySelector('footer.article-footer');
      if (!footer) {
        // Remove any div.article-footer
        const divFooter = document.querySelector('div.article-footer');
        if (divFooter) divFooter.remove();
        footer = document.createElement('footer');
        footer.className = 'article-footer';
        document.body.appendChild(footer);
      }
      // Update footer content
      const prevArticle = i < categoryArticles.length - 1 ? categoryArticles[i + 1] : null;
      const nextArticle = i > 0 ? categoryArticles[i - 1] : null;
      footer.innerHTML = `
        <div class="nav-links">
          <a href="index.html" class="nav-link"><i class="fas fa-arrow-left"></i> Back to ${article.categoryName} Library</a>
          <div class="prev-next-links">
            ${prevArticle ? `<a href="${prevArticle.url}" class="prev-link"><i class="fas fa-chevron-left"></i> Previous: ${prevArticle.title}</a>` : ''}
            ${nextArticle ? `<a href="${nextArticle.url}" class="next-link">Next: ${nextArticle.title} <i class="fas fa-chevron-right"></i></a>` : ''}
          </div>
        </div>
      `;
      // Place footer after .article-content if possible
      const articleContent = document.querySelector('.article-content');
      if (articleContent && articleContent.nextSibling !== footer) {
        articleContent.parentNode.insertBefore(footer, articleContent.nextSibling);
      }
      if (!config.dryRun) {
        saveDom(dom, article.path);
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
    const dom = loadDom(indexPath);
    const document = dom.window.document;
    // Get articles for this category
    const categoryArticles = articles.filter(a => a.category === category.id);
    // Update article count
    const countElement = document.querySelector('.article-meta span');
    if (countElement) {
      countElement.innerHTML = `${categoryArticles.length} articles on ${category.name.toLowerCase()} topics`;
    }
    // Update article list
    const articlesList = document.querySelector('#articlesList');
    if (articlesList) {
      const articlesHtml = categoryArticles.map(article => `
        <div class="article-card" data-tags="${article.tags.join(' ')}">
          <h3><a href="${article.url}">${article.title}</a></h3>
          <div class="article-meta">
            <span><i class="far fa-calendar-alt"></i> ${article.date ? article.date.toLocaleDateString() : ''}</span>
            <span><i class="far fa-clock"></i> ${article.readingTime} min read</span>
          </div>
          <p>${article.description || ''}</p>
          <div class="article-tags">
            ${article.tags.map(tag => `<span class="tag">${tag}</span>`).join('')}
          </div>
        </div>
      `).join('');
      articlesList.innerHTML = articlesHtml;
    }
    if (!config.dryRun) {
      saveDom(dom, indexPath);
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
  const dom = loadDom(indexPath);
  const document = dom.window.document;
  // Update category cards
  const catalogGrid = document.querySelector('.catalog-grid');
  if (catalogGrid) {
    const cardsHtml = libraryConfig.categories.map(category => {
      const categoryArticles = articles.filter(a => a.category === category.id);
      // Compute relative path from catalog/index.html to category index
      const categoryDir = category.path.replace(/^catalog\//, '');
      return `
        <div class="catalog-card">
          <i class="fas fa-${category.id === 'cybersecurity' ? 'shield-alt' : 'music'} icon"></i>
          <h3>${category.name}</h3>
          <p>${category.description || `Explore articles on ${category.name.toLowerCase()} topics.`}</p>
          <p><strong>Articles:</strong> ${categoryArticles.length}</p>
          <a href="${categoryDir}/index.html" class="btn btn-primary">Browse Library <i class="fas fa-arrow-right"></i></a>
        </div>
      `;
    }).join('');
    catalogGrid.innerHTML = cardsHtml;
  }
  if (!config.dryRun) {
    saveDom(dom, indexPath);
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