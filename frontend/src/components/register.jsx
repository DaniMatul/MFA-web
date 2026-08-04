'use client'

import { useState, useEffect } from 'react'

import '@/styles/register.css'
import Biometric from '@/components/biometric'

export default function Register({onAction}){
    const [step, setStep] = useState(1)
    const [roles, setRoles] = useState([])

    useEffect(() => {
        getRoles()
        .then((roles) => setRoles(roles))
        .catch(error => console.error(error));
    }, [])

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
                        store(document.getElementById("email").value, "current_email")
                        }}>Guardar</button>
                    <button className='other-btn' onClick={() => onAction(1)}>Login</button>
                    </>
                )}
                {step == 2 &&(
                    <>
                    <input type="password" id="password" placeholder='Contraseña'/>
                    <button className='accept-btn' onClick={() => {
                        saveUser(sessionStorage.getItem("current_email"), document.getElementById("password").value, setStep)
                        
                        }}>Guardar</button>
                    <button className='other-btn' onClick={() => setStep(1)}>Regresar</button>
                    </>
                )}
                {step == 3 &&(
                    <>
                    <input type="text" placeholder='Biometricos'/>
                    <Biometric email={sessionStorage.getItem("current_email")} mode="register" onSuccess={() => setStep(4)}/>
                    <button className='accept-btn' onClick={() => setStep(4)}>Guardar</button>
                    <button className='other-btn' onClick={() => setStep(1)}>Regresar</button>
                    </>
                )}
                {step == 4 &&(
                    <>
                    <select name="role" id="role_select" className="input" defaultValue="0" > 
                    <option value="0"  disabled>Selecciona un rol</option>
                        {
                            roles.map(role => (
                                <option key={role.id} value={role.id}>{role.name}</option>
                            ))
                            
                        }
                    </select>
                    <button className='accept-btn' onClick={() => {
                        const selectedRole = document.getElementById("role_select").value;
                        
                        saveUserRole(sessionStorage.getItem("current_email"), selectedRole)
                        .then((success) => {
                            alert(success ? "Usuario registrado con éxito" : "Error al registrar el usuario");
                        });
                    }}>Guardar</button>
                    </>
                )}
            </div>
        </div>
        </>
    )
}

function store(value, key){
    sessionStorage.setItem(key, value)
}

async function saveUser(email, password, setStep){
    const passwordError = validatePassword(password)
    if (passwordError){
        alert(passwordError)
        return
    }

    const body = {
        email: email,
        password: password
    }
    const data = await fetch('http://localhost:8000/user/register', {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json'
        },
        body: JSON.stringify(body)
    });
    let result = await data.json()
    console.log(result)
    if (result["status"] == "success"){
        setStep(3)
    } else {
        alert(result["message"]);
        sessionStorage.removeItem("current_email");
        setStep(1)
    }

}

function validatePassword(password){
    if (password.length < 8)
        return "La contraseña debe tener al menos 8 caracteres"
    if (!/[A-Z]/.test(password))
        return "La contraseña debe incluir una letra mayúscula"
    if (!/[a-z]/.test(password))
        return "La contraseña debe incluir una letra minúscula"
    if (!/[0-9]/.test(password))
        return "La contraseña debe incluir un número"
    if (!/[^A-Za-z0-9]/.test(password))
        return "La contraseña debe incluir un carácter especial"
    return null
}

async function getRoles(){
    const response = await fetch('http://localhost:8000/roles/')
    const data = await response.json()
    console.log(data)
    return await data.roles
}

async function saveUserRole(email, roleId){
    const body = {
        email: email,
        role_id: roleId
    }
    const data = await fetch('http://localhost:8000/user/update_role', {
        method: 'PUT',
        headers: {
            'Content-Type': 'application/json'
        },
        body: JSON.stringify(body)
    });
    let result = await data.json()
    console.log(result)
    return result["status"]
}
