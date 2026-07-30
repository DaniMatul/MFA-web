from fastapi import FastAPI

from app.users.routes import router as userRouter
app = FastAPI()

app.include_router(userRouter)