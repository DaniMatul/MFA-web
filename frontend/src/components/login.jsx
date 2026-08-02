'use client'

import { useState, useEffect } from 'react'
import '@/styles/login.css'

export default function Login({onAction}){
    const [step, setStep] = useState(1)
    const [i1, setI1] = useState("")
    const [i2, setI2] = useState("")
    const [i3, setI3] = useState("")
    const [i4, setI4] = useState("")
    const [i5, setI5] = useState("")
    const [i6, setI6] = useState("")

    useEffect(() => {
        const sendHandler = async () =>{
            if (step == 2){
                const response = await fetch('http://localhost:8000/token/send-verification-token', {
                    method: 'GET', //'POST',
                    headers: {"Content-Type": "application/json"},
                    // body: JSON.stringify({
                    //     userEmail: 'lo que obtengamos'
                    // })
                })

                const data = await response.json()
                console.log(data)
            }
        }
        sendHandler()
    }, [step])

    const stepHandler = async () => {
        if (step == 1) {
            
        } else if (step == 2){
            console.log("Verificando token")
            const token = [i1 + i2 + i3 + i4 + i5 + i6].join("")
            console.log(token)

            const response = await fetch(`http://localhost:8000/token/validate-token/${token}`, {
                method: 'POST', //'POST',
                headers: {"Content-Type": "application/json"},
            })

            const data = await response.json()
            console.log(data)

            setStep(3)
        }
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
                    <button className='accept-btn' onClick={() => stepHandler()}>Aceptar</button>
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
