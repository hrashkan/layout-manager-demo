# Enable GitHub Pages - Quick Guide

## Step-by-Step Instructions

### 1. Enable GitHub Pages in Repository Settings

1. Go to your repository: https://github.com/hrashkan/layout-manager-demo
2. Click on **Settings** (top menu bar)
3. In the left sidebar, click **Pages**
4. Under **"Build and deployment"** section:
   - Find **"Source"** dropdown
   - Select **"GitHub Actions"** (NOT "Deploy from a branch")
   - Click **Save**

### 2. Verify Workflow Permissions

1. Still in **Settings**, click **Actions** → **General** (left sidebar)
2. Scroll to **"Workflow permissions"**
3. Select **"Read and write permissions"**
4. Check **"Allow GitHub Actions to create and approve pull requests"**
5. Click **Save**

### 3. Trigger Deployment

After enabling Pages, the workflow will automatically run on the next push. Or you can:

1. Go to **Actions** tab
2. Click on **"Deploy to GitHub Pages"** workflow
3. Click **"Run workflow"** button (top right)
4. Select branch: **main**
5. Click **"Run workflow"**

### 4. Monitor Deployment

1. Go to **Actions** tab
2. Watch the workflow run (takes 2-3 minutes)
3. Once complete, your site will be live at:
   **https://hrashkan.github.io/layout-manager-demo/**

## Troubleshooting

If you still see errors:
- Make sure **"GitHub Actions"** is selected as the source (not a branch)
- Wait a few minutes after enabling - GitHub needs time to set up
- Check the Actions tab for detailed error messages

