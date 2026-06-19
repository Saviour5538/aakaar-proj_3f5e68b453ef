from fastapi import APIRouter, HTTPException, Depends, status
from sqlalchemy.orm import Session
from pydantic import BaseModel, Field, EmailStr
from database.models import Users
from database.config import get_db
from backend.routers.auth import get_current_user

router = APIRouter(prefix="/users", tags=["Users"])

# Pydantic schemas
class UserUpdate(BaseModel):
    full_name: str = Field(..., max_length=100)

class UserResponse(BaseModel):
    id: int
    email: EmailStr
    full_name: str

# Routes
@router.get("/", response_model=list[UserResponse])
def list_users(db: Session = Depends(get_db), current_user: Users = Depends(get_current_user)):
    users = db.query(Users).all()
    return [{"id": user.id, "email": user.email, "full_name": user.full_name} for user in users]

@router.get("/{user_id}", response_model=UserResponse)
def get_user(user_id: int, db: Session = Depends(get_db), current_user: Users = Depends(get_current_user)):
    user = db.query(Users).filter(Users.id == user_id).first()
    if not user:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="User not found")
    return {"id": user.id, "email": user.email, "full_name": user.full_name}

@router.put("/{user_id}", response_model=UserResponse)
def update_user(user_id: int, user_update: UserUpdate, db: Session = Depends(get_db), current_user: Users = Depends(get_current_user)):
    user = db.query(Users).filter(Users.id == user_id).first()
    if not user:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="User not found")
    user.full_name = user_update.full_name
    db.commit()
    db.refresh(user)
    return {"id": user.id, "email": user.email, "full_name": user.full_name}

@router.delete("/{user_id}", status_code=status.HTTP_204_NO_CONTENT)
def delete_user(user_id: int, db: Session = Depends(get_db), current_user: Users = Depends(get_current_user)):
    user = db.query(Users).filter(Users.id == user_id).first()
    if not user:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="User not found")
    db.delete(user)
    db.commit()
    return None