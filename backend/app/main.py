from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from app.api import buy_vs_rent, forward_tracker

app = FastAPI(
    title="Housing Strategy Dashboard API",
    description="API for housing investment analysis and mortgage refinancing decisions",
    version="1.0.0"
)

# Configure CORS
app.add_middleware(
    CORSMiddleware,
    allow_origins=["http://localhost:3000", "http://frontend:3000"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Include API routes
app.include_router(buy_vs_rent.router, prefix="/api/buy-vs-rent", tags=["buy-vs-rent"])
app.include_router(forward_tracker.router, prefix="/api/forward-tracker", tags=["forward-tracker"])

@app.get("/")
async def root():
    return {"message": "Housing Strategy Dashboard API", "version": "1.0.0"}

@app.get("/health")
async def health_check():
    return {"status": "healthy"}
