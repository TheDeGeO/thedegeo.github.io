#!/bin/bash

# Update Site Info Script
# Run this to update all HTML files with the latest site information
# This includes:
# - Article counts in catalog pages
# - Previous/Next navigation in articles
# - Consistent metadata across all pages

echo "Running update-site-info.js to update all site information..."

# Check if Node.js is installed
if ! command -v node &> /dev/null; then
    echo "Error: Node.js is not installed. Please install Node.js to run this script."
    exit 1
fi

# Check if required Node.js modules are installed
if [ ! -d "node_modules/jsdom" ]; then
    echo "Installing required Node.js modules..."
    npm install jsdom
fi

# Run the update script
node js/modules/update-site-info.js

echo "Site update complete!" 