from fastapi import FastAPI, Form
from typing import Annotated
from pydantic import BaseModel

import asyncpg
import os
from dotenv import load_dotenv

from app.users.routes import router as userRouter
from app.token.routes import router as tokenRouter

load_dotenv()
DATABASE_URL = os.getenv("DATABASE_URL")


app = FastAPI()

app.include_router(userRouter)
app.include_router(tokenRouter)


async def connect_db():
    return await asyncpg.connect(DATABASE_URL)



