import sys
import os

# Add the backend directory to Python path
current_dir = os.path.dirname(__file__)
backend_path = os.path.join(current_dir, '..', '..', 'backend')
backend_path = os.path.abspath(backend_path)
sys.path.insert(0, backend_path)

# Import the FastAPI app
try:
    from app.main import app
    
    # This is the entry point for Vercel
    def handler(request):
        return app(request)
        
    # Also expose as a variable
    app_instance = app
    
except ImportError as e:
    print(f"Import error: {e}")
    # Fallback minimal app for debugging
    from fastapi import FastAPI
    app = FastAPI()
    
    @app.get("/")
    def root():
        return {"error": "Backend import failed", "backend_path": backend_path, "sys_path": sys.path}
    
    def handler(request):
        return app(request)
    
    app_instance = app
