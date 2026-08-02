from fastapi import FastAPI, Form
from typing import Annotated
from pydantic import BaseModel

import asyncpg
import os
from dotenv import load_dotenv

load_dotenv()
DATABASE_URL = os.getenv("DATABASE_URL")

from app.users.routes import router as userRouter
app = FastAPI()
app.include_router(userRouter)


async def connect_db():
    return await asyncpg.connect(DATABASE_URL)

