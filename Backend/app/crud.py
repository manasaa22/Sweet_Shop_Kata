from fastapi import Depends, HTTPException, status
from sqlalchemy.orm import Session

from app import models, schemas
from app.security import get_current_user
from app.utils import hash_password

# def create_user(db: Session, user: schemas.UserCreate):
#     hashed_pw = hash_password(user.password)
#     db_user = models.User(
#         username=user.username,
#         email=user.email,
#         hashed_password=hashed_pw
#     )
#     db.add(db_user)
#     db.commit()
#     db.refresh(db_user)
#     return db_user

def create_user(db: Session, user: schemas.UserCreate, role: str = "user"):
    db_user = models.User(
        username=user.username,
        email=user.email,
        hashed_password=hash_password(user.password),
        role=role
    )
    db.add(db_user)
    db.commit()
    db.refresh(db_user)
    return db_user



def get_current_admin(current_user: models.User = Depends(get_current_user)):
    if current_user.role != "admin":
        raise HTTPException(status_code=403, detail="Admins only")
    return current_user

