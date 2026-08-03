from fastapi import FastAPI, Form
from typing import Annotated
from pydantic import BaseModel
from fastapi.middleware.cors import CORSMiddleware

import asyncpg
import os
from dotenv import load_dotenv

from app.users.routes import router as userRouter
from app.token.routes import router as tokenRouter


load_dotenv()
DATABASE_URL = os.getenv("DATABASE_URL")


app = FastAPI()

origins = [
    "http://localhost:3000",
    "http://127.0.0.1:3000",
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


async def connect_db():
    return await asyncpg.connect(DATABASE_URL)



