import './MFA.css'
export default function Home() {
  return (
    <>
    <div className="mfa-general-container">
      <div className="img-container">
        {/* Aqui las imagenes van cambiando dependiendo el paso */}
        <img src="../paso1.webp" alt="p" />
      </div>
      <div className="inputs-container">
        {/* Aqui van los inputs de cada paso */}
        {/* PASO 3 - Solicitar token*/}
        {/* PASO 4 - Solicitar y validar biometrico */}
        <p>Aqui van los inputs de cada paso</p>
      </div>
    </div>
    </>
  );
}
