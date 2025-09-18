# Deployment Guide

## Option 1: Vercel (Recommended - FREE)

### Step 1: Push to GitHub
```bash
git init
git add .
git commit -m "Initial commit"
git branch -M main
git remote add origin https://github.com/YOUR_USERNAME/college-football-calendar.git
git push -u origin main
```

### Step 2: Deploy to Vercel
1. Go to [vercel.com](https://vercel.com)
2. Sign up with GitHub
3. Click "New Project"
4. Import your repository
5. Vercel will automatically deploy

### Step 3: Set up automatic updates
The GitHub Actions workflow will automatically update calendars daily at 6 AM UTC.

**Your calendar URLs will be:**
- `https://your-project.vercel.app/calendars/college-football-top-25.ics`
- `https://your-project.vercel.app/calendars/college-football-top-25-matchups.ics`
- `https://your-project.vercel.app/calendars/notre-dame-football.ics`
- `https://your-project.vercel.app/calendars/ohio-state-football.ics`
- `https://your-project.vercel.app/calendars/oklahoma-football.ics`

## Option 2: Netlify (Alternative - FREE)

### Step 1: Push to GitHub (same as above)

### Step 2: Deploy to Netlify
1. Go to [netlify.com](https://netlify.com)
2. Sign up with GitHub
3. Click "New site from Git"
4. Choose your repository
5. Build command: `npm run build`
6. Publish directory: `.` (root)

### Step 3: Set up automatic updates
Use Netlify's scheduled functions or GitHub Actions.

## Option 3: Railway ($5/month)

### Step 1: Deploy to Railway
1. Go to [railway.app](https://railway.app)
2. Connect GitHub
3. Deploy your repository
4. Set up environment variables if needed

### Step 2: Set up cron job
Railway has built-in cron job support for daily updates.

## Subscribing to Calendars

### Google Calendar
1. Open Google Calendar
2. Click the "+" next to "Other calendars"
3. Choose "From URL"
4. Paste your calendar URL (e.g., `https://your-project.vercel.app/calendars/college-football-top-25.ics`)
5. Click "Add calendar"

### Apple Calendar
1. Open Calendar app
2. Go to File → New Calendar Subscription
3. Paste your calendar URL
4. Click "Subscribe"

### Outlook
1. Open Outlook
2. Go to Add calendar → From internet
3. Paste your calendar URL
4. Click "Add"

## Cost Comparison

| Service | Cost | Bandwidth | Features |
|---------|------|-----------|----------|
| Vercel | FREE | 100GB/month | Auto-deploy, cron jobs |
| Netlify | FREE | 100GB/month | Auto-deploy, functions |
| Railway | $5/month | Unlimited | Full control, cron jobs |

## Recommended: Vercel

Vercel is the best choice because:
- ✅ Completely free
- ✅ Automatic deployments from GitHub
- ✅ Built-in cron job support
- ✅ Fast global CDN
- ✅ Easy to set up
- ✅ Perfect for static files like calendars
