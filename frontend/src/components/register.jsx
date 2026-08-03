'use client'

import { useState } from 'react'

import '@/styles/register.css'
import Biometric from '@/components/biometric'

export default function Register({onAction}){
    const [step, setStep] = useState(1)
    return (
        <>
        <div className="register-general-container">
            <div className="register-img-container">
                {step == 1 &&(<img src="../register1.webp" alt="p" />)}
                {step == 2 &&(<img src="../register2.webp" alt="p" />)}
                {step == 3 &&(<img src="../register3.webp" alt="p" />)}
            </div>
            <div className="register-inputs-container">
                {step == 1 &&(
                    <>
                    <button className='accept-btn'  onClick={() => setStep(2)}>Guardar</button>
                    <button className='other-btn' onClick={() => onAction(1)}>Login</button>
                    </>
                )}
                {step == 2 &&(
                    <>
                    <input type="text" placeholder='Contraseña'/>
                    <button className='accept-btn' onClick={() => setStep(3)}>Guardar</button>
                    <button className='other-btn' onClick={() => setStep(1)}>Regresar</button>
                    </>
                )}
                {step == 3 &&(
                    <>
                    <input type="text" placeholder='Biometricos'/>
                    <Biometric email="mayda.matul@gmail.com" mode="register" onSuccess={() => setStep(4)}/>
                    <button className='accept-btn' onClick={() => setStep(4)}>Guardar</button>
                    <button className='other-btn' onClick={() => setStep(1)}>Regresar</button>
                    </>
                )}
                {step == 4 &&(
                    <p>HOLA aqui definiremos roles</p>
                )}
            </div>
        </div>
        </>
    )
}
