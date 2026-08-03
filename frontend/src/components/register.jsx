'use client'

import { useState } from 'react'

import '@/styles/register.css'

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
                    <input type="text" id="email" placeholder='Gmail'/>
                    <button className='accept-btn'
                      onClick={() =>{ 
                        setStep(2)
                        storeEmail(document.getElementById("email").value)
                        }}>Guardar</button>
                    <button className='other-btn' onClick={() => onAction(1)}>Login</button>
                    </>
                )}
                {step == 2 &&(
                    <>
                    <input type="password" id="password" placeholder='Contraseña'/>
                    <button className='accept-btn' onClick={() => {
                        setStep(3)
                        console.log(localStorage.getItem("current_email"))
                        }}>Guardar</button>
                    <button className='other-btn' onClick={() => setStep(1)}>Regresar</button>
                    </>
                )}
                {step == 3 &&(
                    <>
                    <input type="text" placeholder='Biometricos'/>
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

function storeEmail(email){
    localStorage.setItem('current_email', email)
}