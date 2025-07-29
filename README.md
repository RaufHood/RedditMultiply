# RedditPro AI - Reddit Monitoring & Engagement Platform

An AI-powered platform for monitoring Reddit mentions, discovering relevant communities, and generating compliant engagement responses. Built for brands and businesses to maintain authentic presence on Reddit while following platform guidelines.

## 🎯 What This Application Does

RedditPro AI helps you:

- **🔍 Discover Relevant Communities**: Find subreddits where your target audience discusses topics related to your brand
- **📊 Monitor Brand Mentions**: Automatically track posts and comments mentioning your brand, products, or keywords
- **🤖 Generate Smart Replies**: Create contextually appropriate, compliant response drafts using AI
- **📈 Track Engagement**: Monitor sentiment, response times, and engagement metrics
- **✅ Ensure Compliance**: Check replies against subreddit rules and brand guidelines before posting

## 🏗️ Architecture

This is a full-stack application with:

- **Frontend**: Next.js 14 with TypeScript, shadcn/ui components
- **Backend**: FastAPI (Python) with PRAW for Reddit API integration
- **AI Integration**: Template-based reply generation (expandable to Claude/GPT)
- **Storage**: In-memory storage for MVP (expandable to database)


## 🚀 Quick Start

### Prerequisites

- **Node.js 18+** (for frontend)
- **Python 3.11+** (for backend)
- **Reddit API credentials** (see setup below)

### 1. Get Reddit API Credentials

1. Go to https://www.reddit.com/prefs/apps/
2. Click "Create App" or "Create Another App"
3. Choose "script" as the app type
4. Note down your `client_id` and `client_secret`

### 2. Start the Backend

```bash
# Navigate to backend directory
cd backend

# Create virtual environment
python -m venv venv
source venv/bin/activate  # On Windows: venv\Scripts\activate

# Install dependencies
pip install -r requirements.txt

# Create .env file with your Reddit credentials
echo "REDDIT_CLIENT_ID=your_client_id
REDDIT_CLIENT_SECRET=your_client_secret
REDDIT_USER_AGENT=RedditProAI/1.0
REDDIT_USERNAME=your_username
REDDIT_PASSWORD=your_password" > .env

# Start the server
uvicorn app.main:app --reload --host 0.0.0.0 --port 8000
```

### 3. Start the Frontend

```bash
# Open new terminal and navigate to frontend
cd RedditMultiply

# Install dependencies
npm install

# Start development server
npm run dev
```

### 4. Access the Application

- **Frontend**: http://localhost:3000
- **Backend API**: http://localhost:8000
- **API Documentation**: http://localhost:8000/docs

## 🎮 How to Use

### 1. Onboarding
- Complete the business context wizard
- Set your brand name, tone, and keywords
- Review generated keyword suggestions

### 2. Discover Communities
- Browse AI-recommended subreddits
- Search for specific communities
- Select relevant subreddits for monitoring

### 3. Start Monitoring
- Configure monitoring settings
- Watch for new mentions in real-time
- Review mention feed with priority indicators

### 4. Engage Responsibly
- Click on mentions to see thread details
- Generate AI-powered reply drafts
- Check compliance before posting
- Copy replies to paste manually on Reddit

### 5. Track Performance
- Monitor analytics dashboard
- Track response times and sentiment
- View top-performing subreddits

### Intelligent Knowledge Base (Knowledge Base 2)
- **AI-Powered Document Analysis**: LLM-based content categorization and updates
- **Smart Content Updates**: Automatically updates existing information instead of duplicating
- **Quantitative Tracking**: Maintains counts and metrics (e.g., "5 customers say X, 3 say Y")
- **Context-Aware Editing**: Uses current document state for intelligent suggestions
- **Real-time Diff Visualization**: Shows before/after changes with proper line-by-line highlighting
- **Four Document Categories**: 
  - Competitor Analysis
  - Customer Sentiment 
  - Market Trends
  - Product Intelligence
- **Fallback System**: Gracefully handles AI service failures with keyword-based backup


## 🔧 Configuration

### Environment Variables

**Backend (.env):**
```env
REDDIT_CLIENT_ID=your_reddit_client_id
REDDIT_CLIENT_SECRET=your_reddit_client_secret
REDDIT_USER_AGENT=RedditProAI/1.0
REDDIT_USERNAME=your_reddit_username
REDDIT_PASSWORD=your_reddit_password
```

**Frontend (.env.local):**
```env
NEXT_PUBLIC_API_URL=http://localhost:8000
```

## 🧪 Testing

### Backend API Testing

```bash
# Health check
curl http://localhost:8000/health

# Set brand context
curl -X POST http://localhost:8000/brand/context \
  -H "Content-Type: application/json" \
  -d '{"brand_name": "TestBrand", "keywords": ["test"]}'

# Discover subreddits
curl -X POST http://localhost:8000/subreddits/discover \
  -H "Content-Type: application/json" \
  -d '{"keywords": ["python", "programming"]}'
```

### Frontend Testing

1. Open http://localhost:3000
2. Complete onboarding flow
3. Test subreddit discovery
4. Verify monitoring functionality
5. Test reply generation

## 🚧 Current Limitations (MVP)

- **In-memory Storage**: Data lost on server restart
- **Single User**: No multi-user support
- **Manual Posting**: Copy/paste replies (no OAuth posting)
- **Basic AI**: Not using RAG for small document count
- **No Authentication**: MVP version

## 🔮 Roadmap

### Phase 2 Features
- [ ] Database integration (PostgreSQL)
- [ ] User authentication
- [ ] RAG for updating knowledge base
- [ ] OAuth posting to Reddit
- [ ] Email notifications
- [ ] Advanced analytics

### Phase 3 Features
- [ ] Multi-brand support
- [ ] Team collaboration
- [ ] Advanced compliance rules
- [ ] Historical data analysis
- [ ] Mobile app


## 📚 Documentation

- [Backend Documentation](./backend/README.md)
- [Frontend Documentation](./RedditMultiply/README.md)
- [API Documentation](http://localhost:8000/docs) (when running)

## 📄 License

This project is licensed under the MIT License - see the LICENSE file for details.

## ⚠️ Important Notes

- **Reddit API Compliance**: This tool respects Reddit's API terms of service
- **Manual Posting**: MVP requires manual copy/paste to avoid spam detection
- **Rate Limiting**: Built-in delays to respect Reddit's rate limits
- **Transparency**: Always disclose brand affiliation in replies

---

**Built with ❤️ for authentic Reddit engagement** 