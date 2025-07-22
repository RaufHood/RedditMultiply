import sys
import os
from mangum import Mangum

# Add the backend directory to Python path
current_dir = os.path.dirname(__file__)
backend_path = os.path.join(current_dir, '..', 'backend')
backend_path = os.path.abspath(backend_path)
sys.path.insert(0, backend_path)

# Import the FastAPI app
try:
    from app.main import app
    # Use Mangum to adapt FastAPI for serverless
    handler = Mangum(app)
    
except ImportError as e:
    print(f"Import error: {e}")
    # Fallback minimal app for debugging
    from fastapi import FastAPI
    app = FastAPI()
    
    @app.get("/")
    def root():
        return {"error": "Backend import failed", "backend_path": backend_path, "sys_path": sys.path}
    
    @app.get("/test")
    def test():
        return {"status": "API working", "message": "Serverless function is responding"}
    
    handler = Mangum(app)
