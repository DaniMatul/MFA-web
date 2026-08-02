'use client'

import { useState } from 'react'
import '@/styles/login.css'

export default function Login({onAction}){
    const [step, setStep] = useState(1)
    return (
        <>
        <div className="login-general-container">
            <div className="login-img-container">
                {step == 1 &&(<img src="../register1.webp" alt="p" />)}
                {step == 2 &&(<img src="../register2.webp" alt="p" />)}
                {step == 3 &&(<img src="../register3.webp" alt="p" />)}
            </div>
            <div className="login-inputs-container">
                {step == 1 &&(
                    <>
                    <input type="text" placeholder='Gmail'/>
                    <button className='accept-btn' onClick={() => setStep(2)}>Aceptar</button>
                    <button className='other-btn' onClick={() => onAction(2)}>Registrar</button>
                    </>
                )}
                {step == 2 &&(
                    <>
                    <p>Ingresa token</p>
                    <div className="token-inputs">
                        <input type="text" />
                        <input type="text" />
                        <input type="text" />
                        <input type="text" />
                        <input type="text" />
                        <input type="text" />
                    </div>
                    <button className='accept-btn' onClick={() => setStep(3)}>Aceptar</button>
                    </>
                )}
                {step == 3 &&(
                    <>
                    <p>Pon tu huella en el detector</p>
                    <button className='accept-btn' onClick={() => setStep(1)}>Aceptar</button>
                    </>
                )}
            </div>

        </div>
        </>
    )
}
