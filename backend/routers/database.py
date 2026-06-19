from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session
from database.config import get_db
from database.models import Users, Conversations, Messages
from pydantic import BaseModel, Field
from typing import List
import uuid

router = APIRouter(prefix="/database", tags=["Database"])

# Pydantic Schemas
class UserBase(BaseModel):
    username: str = Field(..., example="johndoe")
    email: str = Field(..., example="johndoe@example.com")

class UserResponse(UserBase):
    id: uuid.UUID

class ConversationBase(BaseModel):
    user_id: uuid.UUID
    title: str = Field(..., example="Sample Conversation")

class ConversationResponse(ConversationBase):
    id: uuid.UUID

class MessageBase(BaseModel):
    conversation_id: uuid.UUID
    sender: str = Field(..., example="user")
    content: str = Field(..., example="Hello, how are you?")

class MessageResponse(MessageBase):
    id: uuid.UUID

# CRUD Endpoints for Users
@router.get("/users", response_model=List[UserResponse])
async def list_users(db: Session = Depends(get_db)):
    users = db.query(Users).all()
    return [UserResponse(id=user.id, username=user.username, email=user.email) for user in users]

@router.get("/users/{user_id}", response_model=UserResponse)
async def get_user(user_id: uuid.UUID, db: Session = Depends(get_db)):
    user = db.query(Users).filter(Users.id == user_id).first()
    if not user:
        raise HTTPException(status_code=404, detail="User not found.")
    return UserResponse(id=user.id, username=user.username, email=user.email)

@router.post("/users", response_model=UserResponse)
async def create_user(user: UserBase, db: Session = Depends(get_db)):
    new_user = Users(id=uuid.uuid4(), username=user.username, email=user.email)
    db.add(new_user)
    db.commit()
    db.refresh(new_user)
    return UserResponse(id=new_user.id, username=new_user.username, email=new_user.email)

@router.delete("/users/{user_id}", status_code=204)
async def delete_user(user_id: uuid.UUID, db: Session = Depends(get_db)):
    user = db.query(Users).filter(Users.id == user_id).first()
    if not user:
        raise HTTPException(status_code=404, detail="User not found.")
    db.delete(user)
    db.commit()

# CRUD Endpoints for Conversations
@router.get("/conversations", response_model=List[ConversationResponse])
async def list_conversations(db: Session = Depends(get_db)):
    conversations = db.query(Conversations).all()
    return [
        ConversationResponse(id=conv.id, user_id=conv.user_id, title=conv.title)
        for conv in conversations
    ]

@router.post("/conversations", response_model=ConversationResponse)
async def create_conversation(conversation: ConversationBase, db: Session = Depends(get_db)):
    new_conversation = Conversations(
        id=uuid.uuid4(), user_id=conversation.user_id, title=conversation.title
    )
    db.add(new_conversation)
    db.commit()
    db.refresh(new_conversation)
    return ConversationResponse(
        id=new_conversation.id, user_id=new_conversation.user_id, title=new_conversation.title
    )

@router.delete("/conversations/{conversation_id}", status_code=204)
async def delete_conversation(conversation_id: uuid.UUID, db: Session = Depends(get_db)):
    conversation = db.query(Conversations).filter(Conversations.id == conversation_id).first()
    if not conversation:
        raise HTTPException(status_code=404, detail="Conversation not found.")
    db.delete(conversation)
    db.commit()

# CRUD Endpoints for Messages
@router.get("/messages", response_model=List[MessageResponse])
async def list_messages(db: Session = Depends(get_db)):
    messages = db.query(Messages).all()
    return [
        MessageResponse(
            id=msg.id, conversation_id=msg.conversation_id, sender=msg.sender, content=msg.content
        )
        for msg in messages
    ]

@router.post("/messages", response_model=MessageResponse)
async def create_message(message: MessageBase, db: Session = Depends(get_db)):
    new_message = Messages(
        id=uuid.uuid4(),
        conversation_id=message.conversation_id,
        sender=message.sender,
        content=message.content,
    )
    db.add(new_message)
    db.commit()
    db.refresh(new_message)
    return MessageResponse(
        id=new_message.id,
        conversation_id=new_message.conversation_id,
        sender=new_message.sender,
        content=new_message.content,
    )

@router.delete("/messages/{message_id}", status_code=204)
async def delete_message(message_id: uuid.UUID, db: Session = Depends(get_db)):
    message = db.query(Messages).filter(Messages.id == message_id).first()
    if not message:
        raise HTTPException(status_code=404, detail="Message not found.")
    db.delete(message)
    db.commit()