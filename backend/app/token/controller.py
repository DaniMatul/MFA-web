import secrets
from fastapi import HTTPException
from passlib.context import CryptContext

from app.token.sendGrid import sendEmail


pwd_context = CryptContext(
    schemes=["bcrypt"],
    deprecated="auto"
)

def sendVerificationCode():
    try: 
        # Obtenemos info de usuario de bd (HARCODEADO)
        email = 'mayda.matul@gmail.com'

        # Primero obtenemos token
        #code = "".join(secrets.choice("0123456789") for _ in range(6)) listo
        token = "123456"
        print(token) 

        # Hasheamos
        hashedToken = pwd_context.hash(token)
        print("hash")
        print(hashedToken)

        # Guardamos token en bd (PENDIENTE)

        # Enviamos token al servicio (LISTO)
        # email = sendEmail(email, token)

        return {"message": "Verification code sent", "email": email}
    except Exception as error:
        raise HTTPException(status_code=500, detail=str(error)) from error

def validateVerificationToken(token: str):
    # Aqui obtenemos al usuairo usando correo
    # Obtener desde bd pero harcodeado para la prueba
    hashedToken = '$2b$12$e12bfoK37kdNhWQYUhuI1O3px3aGV8K/rXj.bJ7USOWyUTBjYSq.O'
    is_valid = pwd_context.verify(
        token,
        hashedToken
    )
    return is_valid

