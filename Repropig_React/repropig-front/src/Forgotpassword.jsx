import { useState } from 'react'
import apiAxios from './api/axiosConfig'

export default function ForgotPassword() {
    const [email, setEmail] = useState('')
    const [mensaje, setMensaje] = useState('')
    const [error, setError] = useState('')
    const [cargando, setCargando] = useState(false)

    const handleSubmit = async (e) => {
        e.preventDefault()

        setMensaje('')
        setError('')
        setCargando(true)

        try {
            const response = await apiAxios.post(
                '/auth/forgot-password',
                { email }
            )

            setMensaje(response.data.message)

        } catch (err) {
            setError(
                err.response?.data?.message ||
                'Error al enviar el correo'
            )
        } finally {
            setCargando(false)
        }
    }

    return (
        <div
            style={{
                minHeight: '100vh',
                background: 'linear-gradient(135deg, #fff0f3, #ffd6e0)',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                padding: '20px'
            }}
        >
            <div
                style={{
                    background: 'white',
                    borderRadius: '20px',
                    padding: '40px',
                    width: '100%',
                    maxWidth: '420px',
                    boxShadow: '0 20px 60px rgba(200, 100, 120, 0.15)'
                }}
            >
                <h2
                    className="text-center mb-3"
                    style={{ color: '#C97A85' }}
                >
                    Recuperar contraseña
                </h2>

                <p
                    className="text-center mb-4"
                    style={{ color: '#777' }}
                >
                    Ingresa tu correo para enviarte un enlace de recuperación
                </p>

                {mensaje && (
                    <div className="alert alert-success">
                        {mensaje}
                    </div>
                )}

                {error && (
                    <div className="alert alert-danger">
                        {error}
                    </div>
                )}

                <form onSubmit={handleSubmit}>
                    <div className="mb-3">
                        <label className="form-label">
                            Correo electrónico
                        </label>

                        <input
                            type="email"
                            className="form-control"
                            placeholder="correo@ejemplo.com"
                            value={email}
                            onChange={(e) => setEmail(e.target.value)}
                            required
                            style={{
                                borderRadius: '10px',
                                padding: '10px'
                            }}
                        />
                    </div>

                    <button
                        type="submit"
                        className="btn w-100"
                        disabled={cargando}
                        style={{
                            background: '#C97A85',
                            color: 'white',
                            borderRadius: '10px',
                            padding: '10px',
                            fontWeight: '600'
                        }}
                    >
                        {cargando
                            ? 'Enviando...'
                            : 'Enviar enlace'}
                    </button>
                </form>
            </div>
        </div>
    )
}