import os

from dotenv import load_dotenv
from sendgrid import SendGridAPIClient
from sendgrid.helpers.mail import Mail

load_dotenv()

api_key = os.getenv("SENDGRID_API_KEY")

if not api_key:
    raise RuntimeError("SENDGRID_API_KEY no fue encontrada")

def sendEmail(email, code):
    try:
        message = Mail(
            from_email='mayda.matul@gmail.com',
            to_emails=email,
            subject="Código de verificación",
            html_content=f"""
                <h2>Verificación de seguridad</h2>
                <p>Tu código de verificación es:</p>
                <h1>{code}</h1>
            """,
        )
        client = SendGridAPIClient(api_key)

        response = client.send(message)

        return {
            "success": True,
            "status_code": response.status_code,
            "message": "Correo enviado correctamente",
        }
    except Exception as error:
        return f'Ocurrio un error: {error}'