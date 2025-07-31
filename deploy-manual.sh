#!/bin/bash

# Manual Deployment Script for GitHub Pages
echo "Starting manual deployment to GitHub Pages..."

# Build the project
echo "Building the project..."
npm run build

# Check if build was successful
if [ ! -d "build" ]; then
    echo "Build failed! build directory not found."
    exit 1
fi

echo "Build successful! Build directory created."

# Instructions for manual deployment
echo ""
echo "=== MANUAL DEPLOYMENT INSTRUCTIONS ==="
echo "1. Create a new branch called 'gh-pages':"
echo "   git checkout -b gh-pages"
echo ""
echo "2. Remove all files from the gh-pages branch:"
echo "   git rm -rf ."
echo ""
echo "3. Copy build contents to the root:"
echo "   cp -r build/* ."
echo ""
echo "4. Add all files and commit:"
echo "   git add ."
echo "   git commit -m 'Deploy to GitHub Pages'"
echo ""
echo "5. Push the gh-pages branch:"
echo "   git push origin gh-pages"
echo ""
echo "6. Go to repository settings and set GitHub Pages source to 'gh-pages' branch"
echo "   https://github.com/Pranay-khandelwal/Reference-data/settings/pages"
echo ""
echo "Your site will be available at: https://pranay-khandelwal.github.io/Reference-data/" 