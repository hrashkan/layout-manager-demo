# How to Enable GitHub Pages - Step by Step

## Quick Steps (2 minutes)

### Step 1: Open Pages Settings

1. Go to: **https://github.com/hrashkan/layout-manager-demo/settings/pages**
2. You should see the "Pages" settings page

### Step 2: Configure Build Source

1. Scroll down to **"Build and deployment"** section
2. Find the **"Source"** dropdown menu
3. Click on it and select **"GitHub Actions"** (NOT "Deploy from a branch")
4. This tells GitHub to use your workflow file for deployment

### Step 3: Handle Custom Domain (if present)

If you see a **"Custom domain"** field with a value:

**Option A - Remove Button:**

- Look for a **"Remove"** or **"Unset"** button next to the domain field
- Click **"Remove"** to clear it

**Option B - Clear Field:**

- Delete all text in the custom domain field
- Leave it completely empty

**Option C - If it won't save:**

- Try entering: `hrashkan.github.io` (just the username part)
- Then click "Remove" or clear it again
- This sometimes helps reset the field

### Step 4: Save Settings

1. Scroll to the bottom of the page
2. Click the **"Save"** button
3. You should see a success message

### Step 5: Verify It's Enabled

After saving, you should see:

- ✅ Green checkmark or "Your site is live at..." message
- The source should show "GitHub Actions"
- No custom domain should be listed

### Step 6: Trigger Deployment

The workflow will run automatically, or you can trigger it manually:

1. Go to: **https://github.com/hrashkan/layout-manager-demo/actions**
2. Click on **"Deploy to GitHub Pages"** workflow
3. Click **"Run workflow"** button (top right)
4. Select branch: **main**
5. Click **"Run workflow"**

### Step 7: Wait for Deployment

- Monitor the workflow at: **https://github.com/hrashkan/layout-manager-demo/actions**
- It takes 2-3 minutes to complete
- Once done, your site will be at: **https://hrashkan.github.io/layout-manager-demo/**

---

## Visual Guide

```
Settings → Pages
├── Build and deployment
│   └── Source: [GitHub Actions] ← Select this
└── Custom domain: [Leave empty or remove]
```

---

## Troubleshooting

**If you can't save:**

- Make sure "GitHub Actions" is selected as Source
- Try refreshing the page and trying again
- Check if there's a CNAME file in your repo (delete it if found)

**If workflow still fails:**

- Wait 1-2 minutes after enabling Pages (GitHub needs time to set up)
- Check the Actions tab for error messages
- Make sure workflow permissions are set to "Read and write"

---

## What Happens Next

Once enabled:

- ✅ Every push to `main` branch will automatically deploy
- ✅ Your site will be live at: `https://hrashkan.github.io/layout-manager-demo/`
- ✅ No manual steps needed for future deployments
