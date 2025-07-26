import sys
import os
from mangum import Mangum

# Add the backend directory to Python path
current_dir = os.path.dirname(__file__)
backend_path = os.path.join(current_dir, '..', 'backend')
backend_path = os.path.abspath(backend_path)

# Also try RedditMultiply/backend path for Vercel
if not os.path.exists(backend_path):
    backend_path = os.path.join(os.path.dirname(current_dir), 'backend')
    backend_path = os.path.abspath(backend_path)

sys.path.insert(0, backend_path)

# Set environment variables for backend
os.environ.setdefault('PYTHONPATH', backend_path)

# Import the FastAPI app
try:
    from app.main import app
    # Use Mangum to adapt FastAPI for serverless
    handler = Mangum(app, lifespan="off")
    
except ImportError as e:
    print(f"Import error: {e}")
    print(f"Backend path: {backend_path}")
    print(f"Directory exists: {os.path.exists(backend_path)}")
    print(f"Files in backend: {os.listdir(backend_path) if os.path.exists(backend_path) else 'N/A'}")
    
    # Fallback minimal app for debugging
    from fastapi import FastAPI
    app = FastAPI()
    
    @app.get("/")
    def root():
        return {
            "error": "Backend import failed", 
            "backend_path": backend_path,
            "directory_exists": os.path.exists(backend_path),
            "import_error": str(e)
        }
    
    @app.get("/test")
    def test():
        return {"status": "API working", "message": "Serverless function is responding"}
    
    handler = Mangum(app, lifespan="off")
