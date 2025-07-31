# Deployment Troubleshooting Guide

## Current Issues
- GitHub Actions workflows are failing
- Multiple deployment attempts have been unsuccessful

## Steps to Resolve

### 1. Enable GitHub Pages in Repository Settings
1. Go to: https://github.com/Pranay-khandelwal/Reference-data/settings
2. Scroll down to "Pages" section in the left sidebar
3. Under "Source", select "GitHub Actions"
4. Save the settings

### 2. Check Repository Permissions
Make sure the repository has the following permissions enabled:
- Actions: Read and write permissions
- Pages: Read and write permissions

### 3. Alternative Deployment Methods

#### Method 1: Manual Deployment
1. Build locally: `npm run build`
2. Create a new branch called `gh-pages`
3. Copy contents of `build/` folder to the root of `gh-pages` branch
4. Push the `gh-pages` branch

#### Method 2: Use Vercel/Netlify
1. Connect repository to Vercel or Netlify
2. Set build command: `npm run build`
3. Set output directory: `build`

### 4. Common Issues and Solutions

#### Issue: Build Fails
- Check for TypeScript errors: `npx tsc --noEmit`
- Check for missing dependencies
- Verify all imports are correct

#### Issue: Deployment Fails
- Check GitHub Pages settings
- Verify repository permissions
- Check workflow logs for specific errors

#### Issue: Site Not Accessible
- Wait 5-10 minutes after deployment
- Check if GitHub Pages is enabled
- Verify the correct branch is being deployed

### 5. Current Configuration
- Homepage: `https://pranay-khandelwal.github.io/Reference-data`
- Build output: `./build`
- Node version: 18
- Dependencies: Using `--legacy-peer-deps`

### 6. Next Steps
1. Monitor the latest workflow run with debugging steps
2. Check the detailed logs for specific error messages
3. Consider alternative deployment platforms if issues persist 