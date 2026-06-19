from fastapi import APIRouter, HTTPException, Depends
from pydantic import BaseModel
from typing import List
import os
from ai.ingest import ingest
from ai.rag import answer

router = APIRouter(prefix='/api/ai')

class IngestRequest(BaseModel):
    user_id: str
    documents: List[str]  # List of file paths

class IngestResponse(BaseModel):
    success: bool
    message: str

class QueryRequest(BaseModel):
    user_id: str
    query: str

class QueryResponse(BaseModel):
    answers: List[str]

@router.post("/ingest", response_model=IngestResponse)
async def ingest_documents(request: IngestRequest):
    try:
        success, message = ingest(user_id=request.user_id, documents=request.documents)
        return IngestResponse(success=success, message=message)
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))

@router.post("/query", response_model=QueryResponse)
async def query_documents(request: QueryRequest):
    try:
        answers = answer(user_id=request.user_id, query=request.query)
        return QueryResponse(answers=answers)
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))