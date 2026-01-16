# Deployment Instructions

## Setup (One-time)

1. **Install Git** if you haven't: https://git-scm.com/download/win

2. **Initialize Git and push to GitHub:**
```bash
git init
git add .
git commit -m "Initial commit: Budget app"
git branch -M main
git remote add origin https://github.com/peepae/peepae.github.io.git
git push -u origin main
```

3. **Enable GitHub Pages in your repo:**
   - Go to https://github.com/peepae/peepae.github.io/settings/pages
   - Under "Source", select "GitHub Actions"
   - Click Save

## Deploying Updates

Every time you push to the `main` branch, GitHub Actions will automatically:
1. Build your Next.js app as static files
2. Deploy to GitHub Pages

**To deploy:**
```bash
git add .
git commit -m "Update budget app"
git push
```

Wait 1-2 minutes, then visit: **https://peepae.github.io/BudgetAppje**

## Manual Deployment (Alternative)

If you prefer manual deployment:
```bash
npm run deploy
```

This builds and pushes directly to the `gh-pages` branch.
