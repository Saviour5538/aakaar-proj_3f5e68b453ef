import uuid
from datetime import datetime
from sqlalchemy.exc import SQLAlchemyError
from database.models import Base, engine, SessionLocal, Users, Conversations, Messages, Documents

def seed_data():
    session = SessionLocal()
    try:
        # Create sample users
        user1 = Users(
            id=uuid.uuid4(),
            username="john_doe",
            email="john.doe@example.com",
            hashed_password="hashed_password_123",
            created_at=datetime.utcnow(),
            updated_at=datetime.utcnow()
        )
        user2 = Users(
            id=uuid.uuid4(),
            username="jane_doe",
            email="jane.doe@example.com",
            hashed_password="hashed_password_456",
            created_at=datetime.utcnow(),
            updated_at=datetime.utcnow()
        )
        session.add_all([user1, user2])
        session.commit()
    except SQLAlchemyError as e:
        session.rollback()
        raise RuntimeError(f"Error seeding data: {e}")
    finally:
        session.close()