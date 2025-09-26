from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from app.api import buy_vs_rent

app = FastAPI(
    title="BrickFi-Lab API",
    description="API for comprehensive housing investment analysis",
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

@app.get("/")
async def root():
    return {"message": "BrickFi-Lab API", "version": "1.0.0"}

@app.get("/health")
async def health_check():
    return {"status": "healthy"}
