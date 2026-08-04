import secrets
from fastapi import HTTPException
from passlib.context import CryptContext

from app.token.sendGrid import sendEmail
from app.utils.database import connect_db


pwd_context = CryptContext(
    schemes=["bcrypt"],
    deprecated="auto"
)

async def sendVerificationCode(userEmail):
    db = await connect_db()
    try: 
        # Primero obtenemos token
        userId = await db.fetchval(
            """
            SELECT id FROM "User" where email = $1
            """, userEmail
        )

        token = "".join(secrets.choice("0123456789") for _ in range(6)) 

        # Hasheamos
        hashedToken = pwd_context.hash(token)

        #Guardamos token en bd 
        saveToken = await db.execute(
            """
            INSERT INTO "Sms_token"(user_id, code, used, tries, status)
            VALUES($1, $2, $3, $4, $5)
            """,
            userId, hashedToken, False, 0, 1
        )

        # Enviamos token al servicio
        email = sendEmail(userEmail, token)
        await db.close()
        return {"message": "Verification code sent", "email": email}

    except Exception as error:
        raise HTTPException(status_code=500, detail=str(error)) from error

async def validateVerificationToken(token: str, userEmail):
    db = await connect_db()
    try: 
        userId = await db.fetchval(
            """
            SELECT id FROM "User" where email = $1
            """, userEmail
        )

        tokenData = await db.fetchrow(
            """
            SELECT code, tries FROM "Sms_token" where user_id = $1 AND status = 1
            """, userId
        )

        is_valid = pwd_context.verify(
            token,
            tokenData["code"]
        )

        status = 0
        if not is_valid: 
            if tokenData["tries"] < 2:
                await db.execute(
                    """
                    UPDATE "Sms_token" SET tries = tries + 1 where user_id = $1  AND status = 1
                    """, userId
                )
                # Volver a intentarlo
                status = 1
            else: 
                await db.execute(
                    """
                    UPDATE "Sms_token" SET tries = tries + 1, status = 0 where user_id = $1 AND status = 1
                    """, userId
                )
                # Generar otro codigo
                status = 2
        else:
            await db.execute(
                """
                UPDATE "Sms_token" SET used = TRUE, status = 0, tries = tries + 1 where user_id = $1  AND status = 1
                """, userId
            )
            # Pasar al siguiente paso
            status = 3

        await db.close()
        return {'is_valid': is_valid, 'status': status}

    except Exception as error:
        raise HTTPException(status_code=500, detail=str(error)) from error

