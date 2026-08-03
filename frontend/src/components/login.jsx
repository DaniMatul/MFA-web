'use client'

import { useState, useEffect } from 'react'
import '@/styles/login.css'
import Biometric from '@/components/biometric'

export default function Login({onAction}){
    const [step, setStep] = useState(1)
    const [status, setStatus] = useState(0)
    const [i1, setI1] = useState("")
    const [i2, setI2] = useState("")
    const [i3, setI3] = useState("")
    const [i4, setI4] = useState("")
    const [i5, setI5] = useState("")
    const [i6, setI6] = useState("")
    
    const email = 'mayda.matul@gmail.com'
    const sendHandler = async () =>{
        if (step == 2){
            const response = await fetch(`http://localhost:8000/token/send-verification-token/${email}`, {
                method: 'GET', //'POST',
                headers: {"Content-Type": "application/json"},
            })
            const data = await response.json()
            console.log(data)
        }
    }
    useEffect(() => {
        sendHandler()
    }, [step])

    const stepHandler = async () => {
        // aque pegar el email del usuaio (albizuri)
        const email = 'mayda.matul@gmail.com'
        if (step == 1) {
            
        } else if (step == 2){
            const token = [i1 + i2 + i3 + i4 + i5 + i6].join("")

            const response = await fetch(`http://localhost:8000/token/validate-token/${token}/${email}`, {
                method: 'POST', //'POST',
                headers: {"Content-Type": "application/json"},
            })

            const data = await response.json()
            console.log(data)
            if (!data.is_valid){
                if(data.status == 1){
                    // Volver a intentar
                    setStatus(1)
                    return
                } else if(data.status == 2){
                    // Enviar codigo
                    setStatus(2)
                    return
                }
            }

            setStep(3)
        }
    }

    const clearHandler = () => {
        setI1("")
        setI2("")
        setI3("")
        setI4("")
        setI5("")
        setI6("")
    }
    
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
                    <p>Se ha enviado un token a su correo electronico</p>
                    <p>Ingresa token</p>
                    <div className="token-inputs">
                        <input type="text" value={i1} onChange={(e) => setI1(e.target.value)}/>
                        <input type="text" value={i2} onChange={(e) => setI2(e.target.value)}/>
                        <input type="text" value={i3} onChange={(e) => setI3(e.target.value)}/>
                        <input type="text" value={i4} onChange={(e) => setI4(e.target.value)}/>
                        <input type="text" value={i5} onChange={(e) => setI5(e.target.value)}/>
                        <input type="text" value={i6} onChange={(e) => setI6(e.target.value)}/>
                    </div>
                    <button className='accept-btn' onClick={() => {stepHandler(), clearHandler()}}>Aceptar</button>
                    {status == 1 &&(
                        <p>Token incorrecto vuelve a intentarlo</p>
                    )}
                    {status == 2 &&(
                        <>
                        <button className='other-btn' onClick={() => {sendHandler(), setStatus(0)}}>Enviar token</button>
                        <p>Ya has probado varias veces este token presiona el botón para enviar otro token</p>
                        </>
                    )}
                    </>
                )}
                {step == 3 &&(
                    <>
                    <Biometric email={email} mode="authenticate" onSuccess={() => setStep(1)}/>
                    </>
                )}
            </div>

        </div>
        </>
    )
}
