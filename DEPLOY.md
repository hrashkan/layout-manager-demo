# GitHub Pages Deployment Guide

This guide will help you deploy this demo to GitHub Pages.

## Prerequisites

1. A GitHub repository (e.g., `your-username/layout-manager-demo`)
2. GitHub Pages enabled in your repository settings

## Setup Steps

### 1. Enable GitHub Pages

1. Go to your repository on GitHub
2. Navigate to **Settings** → **Pages**
3. Under **Source**, select **GitHub Actions**
4. Save the settings

### 2. Update Repository Name (if different)

If your repository name is NOT `layout-manager-demo`, update the base path:

**Option A: Update `vite.config.ts`**

```typescript
const repoName = process.env.REPO_NAME || "your-repo-name";
```

**Option B: Set environment variable in GitHub Actions**
Add to `.github/workflows/deploy.yml`:

```yaml
- name: Build
  run: npm run build:gh-pages
  env:
    GITHUB_PAGES: "true"
    REPO_NAME: "your-repo-name" # Add this line
```

### 3. Push to GitHub

```bash
git add .
git commit -m "Setup GitHub Pages deployment"
git push origin main
```

### 4. Automatic Deployment

The GitHub Actions workflow will automatically:

- Build the project when you push to `main` or `master`
- Deploy to GitHub Pages
- Your demo will be available at: `https://your-username.github.io/layout-manager-demo/`

## Manual Deployment (Alternative)

If you prefer manual deployment:

```bash
# Install gh-pages (if not already installed)
npm install --save-dev gh-pages

# Deploy
npm run deploy
```

This will:

1. Build the project with the correct base path
2. Deploy the `dist` folder to the `gh-pages` branch

## Troubleshooting

### 404 Errors

If you see 404 errors:

- Check that the base path in `vite.config.ts` matches your repository name
- Ensure the path includes leading and trailing slashes: `/repo-name/`

### Assets Not Loading

- Verify the base path is correct
- Check browser console for 404 errors on assets
- Ensure `GITHUB_PAGES=true` is set during build

### Build Fails

- Check GitHub Actions logs
- Ensure all dependencies are in `package.json`
- Verify Node.js version compatibility

## Repository Settings

Make sure your repository has:

- ✅ GitHub Pages enabled (Settings → Pages → Source: GitHub Actions)
- ✅ Actions enabled (Settings → Actions → General → Allow all actions)
