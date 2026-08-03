export default function Credentials({setStep, onAction}){
    return (
        <>
        <input type="text" id="email" placeholder='Gmail' onBlur={() => {checkEmail}}        />
        <input type="password" id="password" placeholder='Contraseña'/>
        <button className='accept-btn' onClick={ () =>{
            checkCredentials(setStep)
            }}>
                Aceptar
        </button>
        <button className='other-btn' onClick={() => onAction(2)}>Registrar</button>
        </>
    )
}

function checkCredentials(setStep){
    const email = document.getElementById('email').value;
    const password = document.getElementById('password').value;

    if (email && password) {
        fetchCredentials(email, password).then((data) => {
            if (data.valid) {
                sessionStorage.setItem("u_id", data.user_id);
                setStep(2)
            } else {
                alert("Error al iniciar sesión. Verifica tus credenciales.");
            }
        })
    }
}

async function fetchCredentials(email, password){
    const body = {
        email: email,
        password: password
    }
    const data = (await fetch('http://localhost:8000/user/login', {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json'
        },
        body: JSON.stringify(body)
    })).json();

    return data
}

function checkEmail(){
    const email = document.getElementById('email').value;   
    if (email) {
        console.log(email)
        fetchEmail(email).then((exists) => {
            if (!exists) {
                alert("Correo no registrado");
            }
        });
    }
}


async function fetchEmail(email){
    const response = await fetch('http://localhost:8000/emails/?email=' + email);
    const data = await response.json();

    return data.exists
}