import '@/styles/welcome.css'

export default function Admin(){
    return(
        <main className="welcome-page">
            <section className="welcome-card">
                <div className="welcome-image-container">
                    <img src="/penguin3.webp" alt="Pingüino de bienvenida" />
                </div>
                <div className="welcome-message">
                    <span className="welcome-badge">MFA</span>
                    <h1>Bienvenido Admin</h1>
                </div>
            </section>
        </main>
    )
}