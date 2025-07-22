# RedditPro AI Backend

A FastAPI-based backend service for Reddit monitoring and engagement automation. This service provides AI-powered tools for discovering relevant subreddits, monitoring brand mentions, generating compliant reply drafts, and analyzing engagement metrics.

## 🚀 Features

- **Subreddit Discovery**: Find relevant communities based on keywords and brand context
- **Real-time Monitoring**: Poll Reddit for new posts and comments matching your criteria
- **AI-Powered Summaries**: Generate intelligent summaries of Reddit threads
- **Compliant Reply Drafts**: Create brand-appropriate response suggestions with compliance checking
- **Analytics Dashboard**: Track mentions, sentiment, and engagement metrics
- **Brand Context Management**: Store and manage your brand guidelines and tone

## 🛠️ Tech Stack

- **Framework**: FastAPI (Python)
- **Reddit API**: PRAW (Python Reddit API Wrapper)
- **Data Validation**: Pydantic
- **Storage**: In-memory (MVP) with JSON persistence
- **Environment**: Python 3.11+

## 📋 Prerequisites

- Python 3.11 or higher
- Reddit API credentials (Client ID, Client Secret, User Agent)
- Virtual environment (recommended)

## 🔧 Installation

1. **Clone the repository and navigate to backend:**
   \`\`\`bash
   cd backend
   \`\`\`

2. **Create and activate virtual environment:**
   \`\`\`bash
   python -m venv venv
   source venv/bin/activate  # On Windows: venv\Scripts\activate
   \`\`\`

3. **Install dependencies:**
   \`\`\`bash
   pip install -r requirements.txt
   \`\`\`

4. **Set up environment variables:**
   Create a `.env` file in the backend directory:
   \`\`\`env
   REDDIT_CLIENT_ID=your_reddit_client_id
   REDDIT_CLIENT_SECRET=your_reddit_client_secret
   REDDIT_USER_AGENT=your_app_name/1.0
   REDDIT_USERNAME=your_reddit_username
   REDDIT_PASSWORD=your_reddit_password
   \`\`\`

## 🚀 Running the Server

1. **Start the development server:**
   \`\`\`bash
   uvicorn app.main:app --reload --host 0.0.0.0 --port 8000
   \`\`\`

2. **Access the API documentation:**
   - Swagger UI: http://localhost:8000/docs
   - ReDoc: http://localhost:8000/redoc

## 📚 API Endpoints

### Brand Management
- `POST /brand/context` - Set brand context and guidelines
- `GET /brand/context` - Retrieve current brand context

### Subreddit Discovery
- `POST /subreddits/discover` - Discover relevant subreddits by keywords
- `GET /subreddits/search?query={query}` - Search subreddits manually

### Monitoring
- `POST /monitor/config` - Configure monitoring settings
- `GET /monitor/mentions` - Get all mentions with optional filters
- `GET /monitor/mentions/{mention_id}` - Get specific mention details
- `POST /monitor/mentions/status` - Update mention status

### Thread Analysis
- `POST /threads/{thread_id}/summary` - Generate AI summary of thread

### Reply Management
- `POST /replies/draft` - Generate AI reply draft
- `GET /replies/draft/{draft_id}` - Get specific reply draft
- `POST /replies/compliance/check` - Check draft compliance

### Analytics
- `GET /analytics/` - Get current analytics snapshot

## 🔄 Background Tasks

The backend includes a monitoring poller that:
- Runs every 3 minutes (configurable)
- Fetches new posts from monitored subreddits
- Filters posts based on configured keywords
- Stores mentions in memory
- Updates analytics automatically

## 🏗️ Project Structure

\`\`\`
backend/
├── app/
│   ├── main.py              # FastAPI application entry point
│   ├── api/                 # API route modules
│   │   ├── brand.py         # Brand context management
│   │   ├── subreddits.py    # Subreddit discovery
│   │   ├── monitoring.py    # Monitoring and mentions
│   │   ├── analytics.py     # Analytics endpoints
│   │   ├── threads.py       # Thread analysis
│   │   └── replies.py       # Reply management
│   ├── models/
│   │   └── schemas.py       # Pydantic data models
│   └── services/
│       ├── reddit_service.py # Reddit API integration
│       └── storage.py       # In-memory storage
├── requirements.txt         # Python dependencies
└── README.md               # This file
\`\`\`

## 🧪 Testing

### Manual API Testing

1. **Set up brand context:**
   \`\`\`bash
   curl -X POST http://localhost:8000/brand/context \
     -H "Content-Type: application/json" \
     -d '{
       "brand_name": "YourBrand",
       "one_line": "Your brand description",
       "keywords": ["keyword1", "keyword2"]
     }'
   \`\`\`

2. **Discover subreddits:**
   \`\`\`bash
   curl -X POST http://localhost:8000/subreddits/discover \
     -H "Content-Type: application/json" \
     -d '{"keywords": ["python", "programming"]}'
   \`\`\`

3. **Start monitoring:**
   \`\`\`bash
   curl -X POST http://localhost:8000/monitor/config \
     -H "Content-Type: application/json" \
     -d '{
       "subreddits": ["r/Python", "r/programming"],
       "keywords": ["python", "programming"]
     }'
   \`\`\`

### Health Check

\`\`\`bash
curl http://localhost:8000/health
\`\`\`

## 🔒 Security Notes

- **Reddit Credentials**: Store securely in environment variables
- **CORS**: Configured for localhost:3000 (frontend)
- **Rate Limiting**: Respects Reddit API rate limits
- **No Authentication**: MVP version - add auth for production

## 🚧 Limitations (MVP)

- **In-memory Storage**: Data lost on server restart
- **No Database**: Uses simple Python data structures
- **Single User**: No multi-user support
- **No OAuth Posting**: Manual copy/paste required
- **Basic Compliance**: Simple rule checking

## 🔮 Future Enhancements

- [ ] Database integration (PostgreSQL/MongoDB)
- [ ] User authentication and authorization
- [ ] Advanced AI integration (Claude/GPT)
- [ ] OAuth posting to Reddit
- [ ] Advanced compliance rules
- [ ] Email/Slack notifications
- [ ] Historical data analysis
- [ ] Multi-brand support

## 🐛 Troubleshooting

### Common Issues

1. **Reddit API Errors:**
   - Verify credentials in `.env`
   - Check Reddit API rate limits
   - Ensure user agent follows Reddit guidelines

2. **Import Errors:**
   - Activate virtual environment
   - Install all requirements: `pip install -r requirements.txt`

3. **CORS Errors:**
   - Ensure frontend runs on `http://localhost:3000`
   - Check CORS configuration in `main.py`

4. **Memory Issues:**
   - Restart server to clear in-memory data
   - Monitor mention count in logs

### Logs

The server logs show:
- API requests and responses
- Reddit API calls
- Background monitoring activity
- Error details

## 📄 License

This project is part of the RedditPro AI application. See the main project README for license information.

## 🤝 Contributing

1. Follow the existing code structure
2. Add proper error handling
3. Update API documentation
4. Test endpoints manually
5. Keep dependencies minimal

---

**Note**: This is an MVP version designed for rapid prototyping and demonstration. For production use, implement proper authentication, database storage, and security measures.
