from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from slowapi import Limiter, _rate_limit_exceeded_handler
from slowapi.util import get_remote_address
from slowapi.errors import RateLimitExceeded
from dotenv import load_dotenv
import os

from .routers import chat_router, generate_router, export_router

# Load environment variables
load_dotenv()

# Initialize rate limiter
limiter = Limiter(key_func=get_remote_address)

# Create FastAPI app
app = FastAPI(
    title="PLAN API",
    description="Chat-driven project planner with LLM-powered entity extraction",
    version="1.0.0"
)

# Add rate limiter to app state
app.state.limiter = limiter
app.add_exception_handler(RateLimitExceeded, _rate_limit_exceeded_handler)

# Configure CORS
origins = os.getenv("CORS_ORIGINS", "https://plan.rupinajay.me,http://localhost:3000").split(",")

app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"] if origins[0] == "*" else origins,
    allow_credentials=True,
    allow_methods=["GET", "POST", "PUT", "DELETE"],
    allow_headers=["*"],
)

# Include routers
app.include_router(chat_router)
app.include_router(generate_router)
app.include_router(export_router)


@app.get("/")
async def root():
    """Root endpoint"""
    return {"message": "PLAN API is running", "version": "1.0.0"}


@app.get("/api/health")
async def health_check():
    """Health check endpoint"""
    return {"status": "healthy", "service": "PLAN API"}


@app.on_event("startup")
async def startup_event():
    """Startup event handler"""
    print("🚀 PLAN API starting up...")
    print(f"📍 CORS origins: {origins}")
    
    # Verify LLM configuration
    llm_base_url = os.getenv("LLM_BASE_URL")
    llm_api_key = os.getenv("LLM_API_KEY")
    
    if not llm_api_key:
        print("⚠️  WARNING: LLM_API_KEY not set in environment")
    else:
        print(f"✅ LLM configured: {llm_base_url}")


@app.on_event("shutdown")
async def shutdown_event():
    """Shutdown event handler"""
    print("👋 PLAN API shutting down...")
