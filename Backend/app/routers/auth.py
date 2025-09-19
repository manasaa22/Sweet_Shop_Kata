from fastapi import APIRouter, Depends, HTTPException, status
from fastapi.security import OAuth2PasswordRequestForm
from passlib.context import CryptContext
from sqlalchemy.orm import Session

from app import crud, models, schemas
from app.db import get_db
from app.models import User
from app.security import create_access_token

router = APIRouter(prefix="/api/auth", tags=["Auth"])

@router.post("/register", response_model=schemas.UserResponse, status_code=status.HTTP_201_CREATED)
def register_user(user: schemas.UserCreate, db: Session = Depends(get_db)):
    # Check if email already exists
    existing_user = db.query(models.User).filter(models.User.email == user.email).first()
    if existing_user:
        raise HTTPException(status_code=400, detail="Email already registered")

    # Pass role from request (defaults to "user")
    return crud.create_user(db=db, user=user, role=user.role)


pwd_context = CryptContext(schemes=["bcrypt"], deprecated="auto")

# @router.post("/login")
# def login(
#     form_data: OAuth2PasswordRequestForm = Depends(),
#     db: Session = Depends(get_db)
# ):
#     # Look up user by username
#     db_user = db.query(User).filter(User.username == form_data.username).first()
#     if not db_user or not pwd_context.verify(form_data.password, db_user.hashed_password):
#         raise HTTPException(
#             status_code=status.HTTP_401_UNAUTHORIZED,
#             detail="Invalid credentials",
#             headers={"WWW-Authenticate": "Bearer"},
#         )

#     # Generate JWT token
#     access_token = create_access_token({"sub": db_user.username})
#     return {"access_token": access_token, "token_type": "bearer"}


@router.post("/login")
def login(
    form_data: OAuth2PasswordRequestForm = Depends(),
    db: Session = Depends(get_db)
):
    username = form_data.username.strip()
    password = form_data.password.strip()
    # Look up user by username
    db_user = db.query(User).filter(User.username == username).first()
    if not db_user or not pwd_context.verify(password, db_user.hashed_password):
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Invalid credentials",
            headers={"WWW-Authenticate": "Bearer"},
        )

    # Generate JWT token
    access_token = create_access_token({"sub": db_user.username})

    # Return token + role
    return {
        "access_token": access_token,
        "token_type": "bearer",
        "role": db_user.role
    }
