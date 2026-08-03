from fastapi import APIRouter
from app.token.controller import sendVerificationCode, validateVerificationToken

router = APIRouter(
    prefix="/token",
    tags=["token"]
)

@router.get("/send-verification-token/{userEmail}")
async def sendSms(userEmail: str):
    rersult = await sendVerificationCode(userEmail)
    return rersult

@router.post("/validate-token/{token}/{userEmail}")
async def validateToken(token: str, userEmail):
    print(token)
    rersult = await validateVerificationToken(token, userEmail)
    return rersult