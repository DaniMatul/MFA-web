'use client'

import { useState } from 'react'
import { useRouter } from "next/navigation";

import '@/styles/biometric.css'
import { createBiometricCredential, getBiometricCredential } from '@/utils/webauthn'

export default function Biometric({email, mode = 'authenticate', onSuccess}) {
    const [loading, setLoading] = useState(false)
    const [message, setMessage] = useState('')

    const biometricHandler = async () => {
        if (!window.PublicKeyCredential || !navigator.credentials) {
            setMessage('Este navegador no es compatible con WebAuthn')
            return
        }

        setLoading(true)
        setMessage('')
        try {
            const action = mode === 'register' ? 'register' : 'authenticate'
            const encodedEmail = encodeURIComponent(email)
            const optionsResponse = await fetch(`http://localhost:8000/biometric/${action}/options?userEmail=${encodedEmail}`, {
                method: 'POST',
                headers: {'Content-Type': 'application/json'},
            })
            const options = await optionsResponse.json()
            if (!optionsResponse.ok) throw new Error(options.detail || 'No se pudo iniciar la biometría')

            const credential = mode === 'register'
                ? await createBiometricCredential(options)
                : await getBiometricCredential(options)

            const verificationResponse = await fetch(`http://localhost:8000/biometric/${action}/verify?userEmail=${encodedEmail}`, {
                method: 'POST',
                headers: {'Content-Type': 'application/json'},
                body: JSON.stringify(credential),
            })
            const verification = await verificationResponse.json()
            if (!verificationResponse.ok) {
                throw new Error(verification.detail || 'No se pudo validar la biometría')
            }

            setMessage(verification.message)
            onSuccess?.(verification)
        } catch (error) {
            if (error.name === 'NotAllowedError') {
                setMessage('La operación biométrica fue cancelada o agotó el tiempo')
            } else {
                setMessage(error.message || 'Ocurrió un error con la biometría')
            }
        } finally {
            setLoading(false)
        }
    }

    return (
        <div className="biometric-container">
            <button className="accept-btn" onClick={biometricHandler} disabled={loading}>
                {loading
                    ? 'Esperando dispositivo...'
                    : mode === 'register' ? 'Registrar biometría' : 'Validar biometría'}
            </button>
            {message && <p className="biometric-message" role="status">{message}</p>}
        </div>
    )
}
