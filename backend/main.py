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



@app.get("/emails/")
async def check_email(email: str):
    conn = await connect_db()
    query = "SELECT * FROM \"User\" WHERE email = $1"
    result = await conn.fetchrow(query, email)
    await disconnect_db()
    return {"exists": result is not None}

@app.post("/user/register")
async def create_user(user: User):
    conn = await connect_db()
    query = "INSERT INTO \"User\" (email, password) VALUES ($1, $2)"
    status = "error"
    data = "Failed to create user"

    try:
        result = await conn.execute(query, user.email, user.password)
    except asyncpg.exceptions.UniqueViolationError:
        status = "error"
        data = "Correo ya registrado"
    else:
        if result and result[-1] == "1":
            result = await conn.fetchrow("SELECT id FROM \"User\" WHERE email = $1", user.email)
            status = "success"
            data = result["id"]
    finally:
        await disconnect_db()
    
    return {"status": status, "message": data}

@app.post("/user/login/")
async def login_user(user: User):
    print(user.email, user.password)
    conn = await connect_db()
    query = "SELECT * FROM \"User\" WHERE email = $1 AND password = $2"
    result = await conn.fetchrow(query, user.email, user.password)
    await disconnect_db()
    
    if result is not None:
        return {"valid": True, "user_id": result["id"]}
    return {"valid": False}

@app.put("/user/update_role/")
async def update_user_role(user:User):
    conn = await connect_db()
    query = "UPDATE \"User\" SET role_id = $1 WHERE email = $2"
    result = await conn.execute(query, user.role_id, user.email)
    print(user.role_id, user.email)
    print(result)
    await disconnect_db()
    
    return {"status" : (result and result[-1] == "1")}

@app.get("/roles/")
async def get_roles():
    conn = await connect_db()
    query = "SELECT * FROM \"Role\""
    result = await conn.fetch(query)
    await disconnect_db()
    print(result)
    return {"roles": result}