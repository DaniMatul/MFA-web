from fastapi import APIRouter
from app.token.controller import sendVerificationCode, validateVerificationToken

router = APIRouter(
    prefix="/token",
    tags=["token"]
)

@router.get("/send-verification-token")
async def sendSms():
    rersult = sendVerificationCode()
    return rersult

@router.post("/validate-token/{token}")
async def validateToken(token: str):
    print(token)
    rersult = validateVerificationToken(token)
    return rersult