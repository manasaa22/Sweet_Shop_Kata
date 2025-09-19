from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.orm import Session

from app import models, schemas
from app.crud import get_current_admin
from app.db import get_db
from app.security import get_current_user

router = APIRouter(prefix="/api/sweets", tags=["sweets"])


# ------------------ CREATE SWEET (ADMIN ONLY) ------------------
@router.post("/", response_model=schemas.SweetResponse, status_code=status.HTTP_201_CREATED)
def create_sweet(
    sweet: schemas.SweetCreate,
    db: Session = Depends(get_db),
    _: models.User = Depends(get_current_admin)
):
    db_sweet = db.query(models.Sweet).filter(models.Sweet.name == sweet.name).first()
    if db_sweet:
        raise HTTPException(status_code=400, detail="Sweet already exists")
    
    # new_sweet = models.Sweet(**sweet.dict())
    new_sweet = models.Sweet(**sweet.model_dump())

    try:
        db.add(new_sweet)
        db.commit()
        db.refresh(new_sweet)
    except Exception:
        db.rollback()
        raise HTTPException(status_code=500, detail="Database error while creating sweet")
    
    return new_sweet


# ------------------ LIST SWEETS (ALL USERS) ------------------
@router.get("/", response_model=list[schemas.SweetResponse])
def list_sweets(
    skip: int = 0,
    limit: int = 50,
    db: Session = Depends(get_db),
    _: models.User = Depends(get_current_user)
):
    return db.query(models.Sweet).offset(skip).limit(limit).all()


# ------------------ UPDATE SWEET (ADMIN ONLY) ------------------
@router.patch("/{sweet_id}", response_model=schemas.SweetResponse)
def update_sweet(
    sweet_id: int,
    sweet: schemas.SweetUpdate,
    db: Session = Depends(get_db),
    _: models.User = Depends(get_current_admin)
):
    # db_sweet = db.query(models.Sweet).get(sweet_id)
    db_sweet = db.get(models.Sweet, sweet_id)

    if not db_sweet:
        raise HTTPException(status_code=404, detail="Sweet not found")
    
    if sweet.price is not None:
        db_sweet.price = sweet.price
    if sweet.quantity is not None:
        db_sweet.quantity = sweet.quantity

    try:
        db.commit()
        db.refresh(db_sweet)
    except Exception:
        db.rollback()
        raise HTTPException(status_code=500, detail="Database error while updating sweet")
    
    return db_sweet


# ------------------ DELETE SWEET (ADMIN ONLY) ------------------
@router.delete("/{sweet_id}", status_code=status.HTTP_204_NO_CONTENT)
def delete_sweet(
    sweet_id: int,
    db: Session = Depends(get_db),
    _: models.User = Depends(get_current_admin)
):
    # sweet = db.query(models.Sweet).get(sweet_id)
    sweet = db.get(models.Sweet, sweet_id)
    if not sweet:
        raise HTTPException(status_code=404, detail="Sweet not found")
    
    try:
        db.delete(sweet)
        db.commit()
    except Exception:
        db.rollback()
        raise HTTPException(status_code=500, detail="Database error while deleting sweet")


# ------------------ SEARCH SWEETS (ALL USERS) ------------------
@router.get("/search", response_model=list[schemas.SweetResponse])
def search_sweets(
    name: str | None = None,
    category: str | None = None,
    min_price: float | None = None,
    max_price: float | None = None,
    skip: int = 0,
    limit: int = 50,
    db: Session = Depends(get_db),
    _: models.User = Depends(get_current_user)
):
    query = db.query(models.Sweet)
    if name:
        query = query.filter(models.Sweet.name.ilike(f"%{name}%"))
    if category:
        query = query.filter(models.Sweet.category.ilike(f"%{category}%"))
    if min_price is not None:
        query = query.filter(models.Sweet.price >= min_price)
    if max_price is not None:
        query = query.filter(models.Sweet.price <= max_price)
    
    return query.offset(skip).limit(limit).all()


# ------------------ PURCHASE SWEET (USER ONLY) ------------------
@router.post("/{sweet_id}/purchase", response_model=schemas.SweetResponse)
def purchase_sweet(
    sweet_id: int,
    db: Session = Depends(get_db),
    user: models.User = Depends(get_current_user)
):
    sweet = db.get(models.Sweet, sweet_id)
    if not sweet or sweet.quantity <= 0:
        raise HTTPException(status_code=400, detail="Sweet not available")
    
    sweet.quantity -= 1
    try:
        db.commit()
        db.refresh(sweet)
    except Exception:
        db.rollback()
        raise HTTPException(status_code=500, detail="Database error while purchasing sweet")
    
    return sweet


# ------------------ RESTOCK SWEET (ADMIN ONLY) ------------------
@router.post("/{sweet_id}/restock", response_model=schemas.SweetResponse)
def restock_sweet(
    sweet_id: int,
    amount: int,
    db: Session = Depends(get_db),
    _: models.User = Depends(get_current_admin)
):
    if amount <= 0:
        raise HTTPException(status_code=400, detail="Restock amount must be positive")
    
    sweet = db.get(models.Sweet, sweet_id)
    if not sweet:
        raise HTTPException(status_code=404, detail="Sweet not found")
    
    sweet.quantity += amount
    try:
        db.commit()
        db.refresh(sweet)
    except Exception:
        db.rollback()
        raise HTTPException(status_code=500, detail="Database error while restocking sweet")
    
    return sweet
