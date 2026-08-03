import json
import secrets
import uuid
from datetime import datetime, timedelta, timezone

from fastapi import HTTPException
from webauthn import (
    generate_authentication_options,
    generate_registration_options,
    verify_authentication_response,
    verify_registration_response,
)
from webauthn.helpers import base64url_to_bytes, bytes_to_base64url, options_to_json
from webauthn.helpers.exceptions import InvalidAuthenticationResponse, InvalidRegistrationResponse
from webauthn.helpers.structs import (
    AuthenticatorAttachment,
    AuthenticatorSelectionCriteria,
    PublicKeyCredentialDescriptor,
    ResidentKeyRequirement,
    UserVerificationRequirement,
)

from app.utils.database import connect_db


RP_ID = "localhost"
RP_NAME = "MFA Web"
EXPECTED_ORIGIN = "http://localhost:3000"
CHALLENGE_MINUTES = 5
BIOMETRIC_TYPE_ID = 1


async def _getUser(db, userEmail):
    user = await db.fetchrow(
        'SELECT id, email FROM "User" WHERE email = $1',
        userEmail,
    )
    if not user:
        raise HTTPException(status_code=404, detail="Usuario no encontrado")
    return user


async def _saveChallenge(db, userId, challenge, ceremony):
    await db.execute(
        """
        UPDATE "Biometric"
        SET data = jsonb_set(data, '{used}', 'true'::jsonb)
        WHERE user_id = $1 AND type_id = $2
          AND data->>'kind' = 'challenge'
          AND data->>'ceremony' = $3
          AND COALESCE((data->>'used')::boolean, FALSE) = FALSE
        """,
        userId, BIOMETRIC_TYPE_ID, ceremony,
    )
    await db.execute(
        """
        INSERT INTO "Biometric"(id, data, user_id, type_id, created_at)
        VALUES($1, $2::jsonb, $3, $4, NOW())
        """,
        uuid.uuid4(),
        json.dumps({
            "kind": "challenge",
            "challenge": bytes_to_base64url(challenge),
            "ceremony": ceremony,
            "expires_at": (
                datetime.now(timezone.utc) + timedelta(minutes=CHALLENGE_MINUTES)
            ).isoformat(),
            "used": False,
        }),
        userId, BIOMETRIC_TYPE_ID,
    )


async def _takeChallenge(db, userId, ceremony):
    challenge = await db.fetchrow(
        """
        UPDATE "Biometric"
        SET data = jsonb_set(data, '{used}', 'true'::jsonb)
        WHERE id = (
            SELECT id
            FROM "Biometric"
            WHERE user_id = $1 AND type_id = $2
              AND data->>'kind' = 'challenge'
              AND data->>'ceremony' = $3
              AND COALESCE((data->>'used')::boolean, FALSE) = FALSE
              AND (data->>'expires_at')::timestamptz > NOW()
            ORDER BY created_at DESC
            LIMIT 1
            FOR UPDATE SKIP LOCKED
        )
        RETURNING data->>'challenge' AS challenge
        """,
        userId, BIOMETRIC_TYPE_ID, ceremony,
    )
    if not challenge:
        raise HTTPException(status_code=400, detail="El reto biométrico expiró o no existe")

    return base64url_to_bytes(challenge["challenge"])


async def generateRegistrationOptions(userEmail):
    db = await connect_db()
    try:
        user = await _getUser(db, userEmail)
        credentials = await db.fetch(
            """
            SELECT data->>'credential_id' AS credential_id
            FROM "Biometric"
            WHERE user_id = $1 AND type_id = $2
              AND data->>'kind' = 'credential'
            """,
            user["id"], BIOMETRIC_TYPE_ID,
        )
        challenge = secrets.token_bytes(32)
        options = generate_registration_options(
            rp_id=RP_ID,
            rp_name=RP_NAME,
            user_id=str(user["id"]).encode("utf-8"),
            user_name=user["email"],
            user_display_name=user["email"],
            challenge=challenge,
            exclude_credentials=[
                PublicKeyCredentialDescriptor(
                    id=base64url_to_bytes(item["credential_id"])
                )
                for item in credentials
            ],
            authenticator_selection=AuthenticatorSelectionCriteria(
                authenticator_attachment=AuthenticatorAttachment.PLATFORM,
                resident_key=ResidentKeyRequirement.PREFERRED,
                user_verification=UserVerificationRequirement.REQUIRED,
            ),
            timeout=60000,
        )
        await _saveChallenge(db, user["id"], challenge, "registration")
        return json.loads(options_to_json(options))
    finally:
        await db.close()


async def verifyRegistration(userEmail, credential):
    db = await connect_db()
    try:
        user = await _getUser(db, userEmail)
        challenge = await _takeChallenge(db, user["id"], "registration")
        verification = verify_registration_response(
            credential=credential,
            expected_challenge=challenge,
            expected_rp_id=RP_ID,
            expected_origin=EXPECTED_ORIGIN,
            require_user_verification=True,
        )
        transports = credential.get("response", {}).get("transports", [])
        credentialId = bytes_to_base64url(verification.credential_id)
        existingCredential = await db.fetchval(
            """
            SELECT id
            FROM "Biometric"
            WHERE type_id = $1 AND data->>'kind' = 'credential'
              AND data->>'credential_id' = $2
            """,
            BIOMETRIC_TYPE_ID, credentialId,
        )
        if not existingCredential:
            await db.execute(
                """
                INSERT INTO "Biometric"(id, data, user_id, type_id, created_at)
                VALUES($1, $2::jsonb, $3, $4, NOW())
                """,
                uuid.uuid4(),
                json.dumps({
                    "kind": "credential",
                    "credential_id": credentialId,
                    "public_key": bytes_to_base64url(
                        verification.credential_public_key
                    ),
                    "sign_count": verification.sign_count,
                    "device_type": verification.credential_device_type.value,
                    "backed_up": verification.credential_backed_up,
                    "transports": transports,
                    "last_used_at": None,
                }),
                user["id"], BIOMETRIC_TYPE_ID,
            )
        return {"verified": True, "message": "Biometría registrada correctamente"}
    except InvalidRegistrationResponse as error:
        raise HTTPException(status_code=400, detail="No se pudo validar la biometría") from error
    finally:
        await db.close()


async def generateAuthenticationOptions(userEmail):
    db = await connect_db()
    try:
        user = await _getUser(db, userEmail)
        credentials = await db.fetch(
            """
            SELECT data->>'credential_id' AS credential_id
            FROM "Biometric"
            WHERE user_id = $1 AND type_id = $2
              AND data->>'kind' = 'credential'
            """,
            user["id"], BIOMETRIC_TYPE_ID,
        )
        if not credentials:
            raise HTTPException(status_code=404, detail="El usuario no tiene biometría registrada")

        challenge = secrets.token_bytes(32)
        options = generate_authentication_options(
            rp_id=RP_ID,
            challenge=challenge,
            allow_credentials=[
                PublicKeyCredentialDescriptor(
                    id=base64url_to_bytes(item["credential_id"])
                )
                for item in credentials
            ],
            user_verification=UserVerificationRequirement.REQUIRED,
            timeout=60000,
        )
        await _saveChallenge(db, user["id"], challenge, "authentication")
        return json.loads(options_to_json(options))
    finally:
        await db.close()


async def verifyAuthentication(userEmail, credential):
    db = await connect_db()
    try:
        user = await _getUser(db, userEmail)
        credentialId = credential["id"]
        savedCredential = await db.fetchrow(
            """
            SELECT id, data
            FROM "Biometric"
            WHERE user_id = $1 AND type_id = $2
              AND data->>'kind' = 'credential'
              AND data->>'credential_id' = $3
            """,
            user["id"], BIOMETRIC_TYPE_ID, credentialId,
        )
        if not savedCredential:
            raise HTTPException(status_code=404, detail="Credencial biométrica no encontrada")

        challenge = await _takeChallenge(db, user["id"], "authentication")
        savedData = savedCredential["data"]
        if isinstance(savedData, str):
            savedData = json.loads(savedData)
        verification = verify_authentication_response(
            credential=credential,
            expected_challenge=challenge,
            expected_rp_id=RP_ID,
            expected_origin=EXPECTED_ORIGIN,
            credential_public_key=base64url_to_bytes(savedData["public_key"]),
            credential_current_sign_count=int(savedData["sign_count"]),
            require_user_verification=True,
        )
        await db.execute(
            """
            UPDATE "Biometric"
            SET data = data || jsonb_build_object(
                'sign_count', $1::bigint,
                'last_used_at', NOW()
            )
            WHERE id = $2 AND type_id = $3
            """,
            verification.new_sign_count,
            savedCredential["id"],
            BIOMETRIC_TYPE_ID,
        )
        return {
            "verified": True,
            "status": 3,
            "message": "Biometría validada correctamente",
            "credential_id": credentialId,
        }
    except InvalidAuthenticationResponse as error:
        raise HTTPException(status_code=401, detail="Biometría no válida") from error
    finally:
        await db.close()
