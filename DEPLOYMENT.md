# 🚀 Deployment Guide - Reddit AI on Vercel

## Quick Deploy (5 minutes!)

### 1. **Commit and Push Your Code**
\`\`\`bash
git add .
git commit -m "Add Vercel deployment configuration"
git push origin main
\`\`\`

### 2. **Deploy on Vercel**
1. Go to [vercel.com](https://vercel.com) and sign in with GitHub
2. Click **"New Project"** 
3. Select your `reddit` repository
4. Choose **"RedditMultiply"** as the root directory
5. Click **"Deploy"**

### 3. **Set Environment Variables**
After deployment, go to your Vercel dashboard:
1. Click your project → **"Settings"** → **"Environment Variables"**
2. Add these variables:

\`\`\`
REDDIT_CLIENT_ID=your_reddit_client_id
REDDIT_CLIENT_SECRET=your_reddit_client_secret  
REDDIT_USER_AGENT=your_reddit_username
OPENAI_API_KEY=your_openai_api_key
OPENAI_MODEL=gpt-4o-mini
\`\`\`

### 4. **Redeploy**
After adding environment variables:
1. Go to **"Deployments"** tab
2. Click **"Redeploy"** on the latest deployment

## ✅ **What's Deployed**

- ✅ **Frontend**: Next.js app at `https://your-app.vercel.app`
- ✅ **Backend**: FastAPI API at `https://your-app.vercel.app/api`
- ✅ **Database**: In-memory storage (resets on each deployment)
- ✅ **AI Features**: OpenAI integration for sentiment & replies

## 🔧 **How It Works**

### Frontend → Backend Communication
- **Local Dev**: `http://localhost:8000/api/...`
- **Production**: `https://your-app.vercel.app/api/...`

### File Structure
\`\`\`
RedditMultiply/
├── api/
│   └── index.py          # Vercel entry point
├── backend/              # Your FastAPI code
├── app/                  # Next.js frontend  
├── vercel.json          # Vercel configuration
└── requirements.txt     # Python dependencies
\`\`\`

## 🆓 **Vercel Free Tier Limits**
- ✅ **Serverless Functions**: 100GB-hours/month
- ✅ **Bandwidth**: 100GB/month
- ✅ **Invocations**: 1M function calls/month
- ✅ **Build Time**: 100 hours/month

Perfect for small to medium applications!

## 🔄 **Auto-Deployment**
Every push to `main` branch automatically deploys to Vercel!

## 🐛 **Troubleshooting**

### If deployment fails:
1. Check Vercel build logs for Python errors
2. Verify `requirements.txt` has all dependencies
3. Check environment variables are set correctly

### If API doesn't work:
1. Test individual endpoints: `https://your-app.vercel.app/api/health`
2. Check Vercel function logs for errors
3. Verify environment variables in Vercel dashboard

### If frontend can't connect to API:
1. Check browser Network tab for 404/500 errors
2. Verify API_BASE_URL is correctly set in production
3. Clear browser cache and try again

## 🔍 **Testing Your Deployment**

After deployment:
1. **Health Check**: `https://your-app.vercel.app/api/health`
2. **Main App**: `https://your-app.vercel.app`
3. **Brand Setup**: Go through onboarding flow
4. **Monitor Reddit**: Add subreddits and keywords
5. **AI Features**: Test thread analysis and reply generation

## 🎯 **Next Steps**

- Add persistent database (PostgreSQL on Supabase/PlanetScale)
- Set up custom domain
- Configure monitoring and alerts
- Add rate limiting for production use

Enjoy your deployed Reddit AI tool! 🎉
