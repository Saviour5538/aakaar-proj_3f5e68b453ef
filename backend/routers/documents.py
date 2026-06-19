from fastapi import APIRouter, Depends, HTTPException, UploadFile, Form
from pydantic import BaseModel, Field
from sqlalchemy.orm import Session
from database.models import Documents
from database.config import get_db
from typing import List, Optional
import uuid
import os
from PyPDF2 import PdfReader
from docx import Document as DocxDocument

router = APIRouter(prefix="/documents", tags=["Documents"])

# Pydantic Schemas
class DocumentBase(BaseModel):
    title: str = Field(..., example="Sample Document")
    description: Optional[str] = Field(None, example="A brief description of the document.")
    metadata: Optional[dict] = Field(None, example={"author": "John Doe", "category": "Research"})

class DocumentCreate(DocumentBase):
    pass

class DocumentResponse(DocumentBase):
    id: uuid.UUID
    created_at: str

# CRUD Endpoints
@router.post("/", response_model=DocumentResponse)
async def upload_document(
    file: UploadFile,
    title: str = Form(...),
    description: Optional[str] = Form(None),
    metadata: Optional[str] = Form(None),
    db: Session = Depends(get_db),
):
    try:
        # Extract text from file
        if file.content_type == "application/pdf":
            reader = PdfReader(file.file)
            text = "".join(page.extract_text() for page in reader.pages)
        elif file.content_type == "application/vnd.openxmlformats-officedocument.wordprocessingml.document":
            doc = DocxDocument(file.file)
            text = "\n".join([p.text for p in doc.paragraphs])
        elif file.content_type == "text/plain":
            text = file.file.read().decode("utf-8")
        else:
            raise HTTPException(status_code=400, detail="Unsupported file type.")

        # Save document to database
        document = Documents(
            id=uuid.uuid4(),
            title=title,
            description=description,
            metadata=metadata,
            content=text,
            created_at=datetime.utcnow(),
        )
        db.add(document)
        db.commit()
        db.refresh(document)

        return DocumentResponse(
            id=document.id,
            title=document.title,
            description=document.description,
            metadata=document.metadata,
            created_at=document.created_at.isoformat(),
        )
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))

@router.get("/", response_model=List[DocumentResponse])
async def list_documents(db: Session = Depends(get_db)):
    documents = db.query(Documents).all()
    return [
        DocumentResponse(
            id=doc.id,
            title=doc.title,
            description=doc.description,
            metadata=doc.metadata,
            created_at=doc.created_at.isoformat(),
        )
        for doc in documents
    ]

@router.get("/{document_id}", response_model=DocumentResponse)
async def get_document(document_id: uuid.UUID, db: Session = Depends(get_db)):
    document = db.query(Documents).filter(Documents.id == document_id).first()
    if not document:
        raise HTTPException(status_code=404, detail="Document not found.")
    return DocumentResponse(
        id=document.id,
        title=document.title,
        description=document.description,
        metadata=document.metadata,
        created_at=document.created_at.isoformat(),
    )

@router.put("/{document_id}", response_model=DocumentResponse)
async def update_document(
    document_id: uuid.UUID,
    update_data: DocumentCreate,
    db: Session = Depends(get_db),
):
    document = db.query(Documents).filter(Documents.id == document_id).first()
    if not document:
        raise HTTPException(status_code=404, detail="Document not found.")

    document.title = update_data.title
    document.description = update_data.description
    document.metadata = update_data.metadata
    db.commit()
    db.refresh(document)

    return DocumentResponse(
        id=document.id,
        title=document.title,
        description=document.description,
        metadata=document.metadata,
        created_at=document.created_at.isoformat(),
    )

@router.delete("/{document_id}", status_code=204)
async def delete_document(document_id: uuid.UUID, db: Session = Depends(get_db)):
    document = db.query(Documents).filter(Documents.id == document_id).first()
    if not document:
        raise HTTPException(status_code=404, detail="Document not found.")

    db.delete(document)
    db.commit()