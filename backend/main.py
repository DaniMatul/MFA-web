from fastapi import FastAPI
from typing import Annotated
from pydantic import BaseModel
from fastapi.middleware.cors import CORSMiddleware

import asyncpg
import os
from dotenv import load_dotenv

from app.users.routes import router as userRouter
from app.token.routes import router as tokenRouter
from app.biometric.routes import router as biometricRouter

from app.utils.database import connect_db, disconnect_db
from app.utils.models import User

load_dotenv()
app = FastAPI()

origins = [
    "http://localhost:3000",
    "http://localhost:5173",
]

app.add_middleware(
    CORSMiddleware,
    allow_origins=origins,
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

app.include_router(userRouter)
app.include_router(tokenRouter)
app.include_router(biometricRouter)


async def connect_db():
    return await asyncpg.connect(DATABASE_URL)



@app.get("/emails/")
async def check_email(email: str):
    conn = await connect_db()
    query = "SELECT * FROM \"User\" WHERE email = $1"
    result = await conn.fetchrow(query, email)
    disconnect_db()
    return {"exists": result is not None}

@app.post("/user/login/")
async def login_user(user: User):
    conn = await connect_db()
    query = "SELECT * FROM \"User\" WHERE email = $1 AND password = $2"
    result = await conn.fetchrow(query, user.email, user.password)
    disconnect_db()
    
    if result is not None:
        print(result["email"])
        return {"valid": True, "user_id": result["id"]}
