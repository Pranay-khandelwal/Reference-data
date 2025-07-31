# Vercel Deployment Guide

## Quick Deploy to Vercel

### Option 1: Deploy via Vercel Dashboard
1. Go to [vercel.com](https://vercel.com)
2. Click "New Project"
3. Import your GitHub repository: `Pranay-khandelwal/Reference-data`
4. Vercel will automatically detect it's a React app
5. Click "Deploy"

### Option 2: Deploy via Vercel CLI
```bash
# Install Vercel CLI
npm i -g vercel

# Deploy
vercel

# Follow the prompts
```

## Configuration Files Added

### `vercel.json`
- Specifies `--legacy-peer-deps` for npm install
- Sets up proper routing for React Router
- Configures build output directory

### `.npmrc`
- Sets `legacy-peer-deps=true` globally for npm

### `package.json`
- Added Node.js and npm version requirements

## Benefits of Vercel Deployment

✅ **Automatic HTTPS** - SSL certificates included  
✅ **Global CDN** - Fast loading worldwide  
✅ **Automatic Deployments** - Deploys on every push to main  
✅ **Preview Deployments** - Creates preview URLs for pull requests  
✅ **Easy Domain Management** - Custom domains supported  
✅ **Built-in Analytics** - Performance monitoring included  

## Your Site URL
Once deployed, your site will be available at:
`https://your-project-name.vercel.app`

## Troubleshooting

If you encounter any issues:
1. Check the build logs in Vercel dashboard
2. Ensure all configuration files are committed
3. Verify the repository is properly connected 