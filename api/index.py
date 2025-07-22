import sys
import os

# Add the backend directory to Python path
backend_path = os.path.join(os.path.dirname(__file__), '..', '..', 'backend')
backend_path = os.path.abspath(backend_path)
sys.path.insert(0, backend_path)

# Import the FastAPI app
from app.main import app

# Vercel entry point
def handler(request):
    return app

# For Vercel
app = app
