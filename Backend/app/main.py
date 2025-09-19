#models.Base.metadata.create_all(bind=engine)
import os

from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware

from app import models
from app.db import engine
from app.routers import auth, sweets

# Create the database tables
models.Base.metadata.create_all(bind=engine)


app = FastAPI()

app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],   # allow all origins
    allow_credentials=True,
    allow_methods=["*"],   # allow all HTTP methods (GET, POST, PUT, DELETE, etc.)
    allow_headers=["*"],   # allow all headers
)

#Router
app.include_router(auth.router)
app.include_router(sweets.router)
@app.get("/")
def root():
    return {"message": "Sweet Shop API is running 🚀"}