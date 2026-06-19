import os
import uuid
from datetime import datetime
from sqlalchemy import (
    create_engine, Column, String, Text, JSON, Integer, ForeignKey, TIMESTAMP, CheckConstraint, Index
)
from sqlalchemy.orm import declarative_base, relationship, sessionmaker
from sqlalchemy.dialects.postgresql import UUID, JSONB, VECTOR

DATABASE_URL_ENV = "DATABASE_URL"
DATABASE_URL = os.environ.get(DATABASE_URL_ENV)

if not DATABASE_URL:
    raise RuntimeError(f"Environment variable '{DATABASE_URL_ENV}' is not set.")

Base = declarative_base()
engine = create_engine(DATABASE_URL)
SessionLocal = sessionmaker(bind=engine)

class Users(Base):
    __tablename__ = "users"
    id = Column(UUID(as_uuid=True), primary_key=True, default=uuid.uuid4)
    username = Column(String(50), nullable=False, unique=True)
    email = Column(String(100), nullable=False, unique=True)
    hashed_password = Column(String(255), nullable=False)
    created_at = Column(TIMESTAMP, default=datetime.utcnow, nullable=False)
    updated_at = Column(TIMESTAMP, default=datetime.utcnow, nullable=False)

class Conversations(Base):
    __tablename__ = "conversations"
    id = Column(UUID(as_uuid=True), primary_key=True, default=uuid.uuid4)
    user_id = Column(UUID(as_uuid=True), ForeignKey("users.id"), nullable=False)
    title = Column(String(255), nullable=False)
    created_at = Column(TIMESTAMP, default=datetime.utcnow, nullable=False)
    updated_at = Column(TIMESTAMP, default=datetime.utcnow, nullable=False)
    user = relationship("Users", back_populates="conversations")

class Messages(Base):
    __tablename__ = "messages"
    id = Column(UUID(as_uuid=True), primary_key=True, default=uuid.uuid4)
    conversation_id = Column(UUID(as_uuid=True), ForeignKey("conversations.id"), nullable=False)
    sender = Column(String(50), nullable=False)
    content = Column(Text, nullable=False)
    created_at = Column(TIMESTAMP, default=datetime.utcnow, nullable=False)
    conversation = relationship("Conversations", back_populates="messages")

class Documents(Base):
    __tablename__ = "documents"
    id = Column(UUID(as_uuid=True), primary_key=True, default=uuid.uuid4)
    title = Column(String(255), nullable=False)
    description = Column(Text, nullable=True)
    file_path = Column(String(255), nullable=False)
    metadata = Column(JSONB, nullable=True)
    created_at = Column(TIMESTAMP, default=datetime.utcnow, nullable=False)
    updated_at = Column(TIMESTAMP, default=datetime.utcnow, nullable=False)

Users.conversations = relationship("Conversations", back_populates="user", cascade="all, delete-orphan")
Conversations.messages = relationship("Messages", back_populates="conversation", cascade="all, delete-orphan")