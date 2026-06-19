```python
import os
import logging
from datetime import datetime
from fastapi import FastAPI, HTTPException, Request
from fastapi.middleware.cors import CORSMiddleware
from fastapi.responses import JSONResponse
from pydantic import ValidationError
from contextlib import asynccontextmanager
from database.config import init_db
from backend.routers import documents, embeddings, chat

# Initialize logging
logging.basicConfig(level=logging.INFO)
logger = logging.getLogger(__name__)

# FastAPI app initialization
app = FastAPI(
    title="RAG System API",
    description="API for Retrieval-Augmented Generation system with document upload and query capabilities.",
    version="1.0.0",
)

# CORS middleware
app.add_middleware(
    CORSMiddleware,
    allow_origins=["http://localhost:3000", "*"],  # Allow all origins for development
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Lifespan context manager for startup/shutdown
@asynccontextmanager
async def lifespan(app: FastAPI):
    logger.info("Starting up the application...")
    init_db()  # Initialize the database
    yield
    logger.info("Shutting down the application...")

app.router.lifespan_context = lifespan

# Mount routers
app.include_router(documents.router, prefix="/api/documents", tags=["Documents"])
app.include_router(embeddings.router, prefix="/api/embed", tags=["Embeddings"])
app.include_router(chat.router, prefix="/api/chat", tags=["Chat"])

# Health check endpoint
@app.get("/health", tags=["Health"])
async def health_check():
    return {"status": "ok", "timestamp": datetime.utcnow().isoformat()}

# Global exception handlers
@app.exception_handler(HTTPException)
async def http_exception_handler(request: Request, exc: HTTPException):
    logger.error(f"HTTPException: {exc.detail}")
    return JSONResponse(
        status_code=exc.status_code,
        content={"error": exc.detail},
    )

@app.exception_handler(ValidationError)
async def validation_exception_handler(request: Request, exc: ValidationError):
    logger.error(f"ValidationError: {exc.errors()}")
    return JSONResponse(
        status_code=422,
        content={"error": exc.errors()},
    )

@app.exception_handler(Exception)
async def general_exception_handler(request: Request, exc: Exception):
    logger.error(f"Unhandled Exception: {str(exc)}")
    return JSONResponse(
        status_code=500,
        content={"error": "Internal Server Error"},
    )

# Main entry point
if __name__ == "__main__":
    import uvicorn

    uvicorn.run(app, host="0.0.0.0", port=8000)
```