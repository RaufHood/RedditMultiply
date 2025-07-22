import sys
import os

# Add the backend directory to Python path - fix the path to go up 2 levels
backend_path = os.path.join(os.path.dirname(__file__), '..', '..', 'backend')
sys.path.append(backend_path)

# Now import the FastAPI app
from app.main import app

# This is the entry point for Vercel
handler = app