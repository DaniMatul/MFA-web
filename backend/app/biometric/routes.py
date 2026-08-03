from typing import Any

from fastapi import APIRouter

from app.biometric.controller import (
    generateAuthenticationOptions,
    generateRegistrationOptions,
    verifyAuthentication,
    verifyRegistration,
)


router = APIRouter(
    prefix="/biometric",
    tags=["biometric"]
)


@router.post("/register/options")
async def registrationOptions(userEmail: str):
    return await generateRegistrationOptions(userEmail)


@router.post("/register/verify")
async def registrationVerification(userEmail: str, credential: dict[str, Any]):
    return await verifyRegistration(userEmail, credential)


@router.post("/authenticate/options")
async def authenticationOptions(userEmail: str):
    return await generateAuthenticationOptions(userEmail)


@router.post("/authenticate/verify")
async def authenticationVerification(userEmail: str, credential: dict[str, Any]):
    return await verifyAuthentication(userEmail, credential)
