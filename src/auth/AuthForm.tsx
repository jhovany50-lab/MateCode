
import { useState } from 'react'
import { registerUser, loginUser } from './authService'

export default function AuthForm() {
    const [isRegistering, setIsRegistering] = useState(false)
    const [email, setEmail] = useState('')
    const [password, setPassword] = useState('')
    const [error, setError] = useState('')
    const [loading, setLoading] = useState(false)

    async function handleSubmit(event: React.FormEvent<HTMLFormElement>) {
        event.preventDefault()
        setError('')
        setLoading(true)

        try {
            if (isRegistering) {
                await registerUser(email, password)
            } else {
                await loginUser(email, password)
            }
        } catch {
            setError('No fue posible completar la operación. Verifica tus datos.')
        } finally {
            setLoading(false)
        }
    }

    return (
        <main className="auth-container">
            <h1>MateCode</h1>

            <h2>
                {isRegistering ? 'Crear cuenta' : 'Iniciar sesión'}
            </h2>

            <form onSubmit={handleSubmit}>
                <input
                    type="email"
                    placeholder="Correo electrónico"
                    value={email}
                    onChange={(event) => setEmail(event.target.value)}
                    required
                />

                <input
                    type="password"
                    placeholder="Contraseña"
                    value={password}
                    onChange={(event) => setPassword(event.target.value)}
                    required
                    minLength={6}
                />

                {error && <p role="alert">{error}</p>}

                <button type="submit" disabled={loading}>
                    {loading
                        ? 'Procesando...'
                        : isRegistering
                            ? 'Registrarme'
                            : 'Entrar'}
                </button>
            </form>

            <p>
                {isRegistering
                    ? '¿Ya tienes una cuenta?'
                    : '¿Aún no tienes cuenta?'}
            </p>

            <button
                type="button"
                onClick={() => {
                    setIsRegistering(!isRegistering)
                    setError('')
                }}
            >
                {isRegistering ? 'Iniciar sesión' : 'Crear una cuenta'}
            </button>
        </main>
    )
}
