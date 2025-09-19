from pydantic import BaseModel, ConfigDict, EmailStr


class UserCreate(BaseModel):
    username: str
    email: EmailStr
    password: str
    role:str = "user"  # Default role is "user"

class UserResponse(BaseModel):
    id: int
    username: str
    email: EmailStr

    model_config = ConfigDict(from_attributes=True)

class UserLogin(BaseModel):
    username: str
    password: str

class SweetBase(BaseModel):
    name: str
    category:str
    price: float
    quantity: int

class SweetCreate(SweetBase):
    pass

class SweetUpdate(BaseModel):
    category: str | None = None
    price: float | None = None
    quantity: int | None = None

class SweetResponse(SweetBase):
    id: int

    model_config = ConfigDict(from_attributes=True)
