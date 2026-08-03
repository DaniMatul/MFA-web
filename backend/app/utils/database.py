import asyncpg
import os
from dotenv import load_dotenv

load_dotenv()

DATABASE_URL = os.getenv("DATABASE_URL")
connection = None

async def connect_db():
    global connection
    if not DATABASE_URL:
        raise ValueError("DATABASE_URL is not set in the environment variables.")
    if not connection:
        connection = await asyncpg.connect(DATABASE_URL)
    return connection

async def disconnect_db():
    global connection
    if connection:
        await connection.close()
        connection = None

