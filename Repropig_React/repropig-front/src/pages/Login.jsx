import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import apiAxios from '../api/axiosConfig'
import { useAuth } from '../context/AuthContext'
import logo from '../assets/logo.png'

export default function Login() {
    const [email, setEmail] = useState('')
    const [password, setPassword] = useState('')
    const [error, setError] = useState('')
    const [cargando, setCargando] = useState(false)
    const { login } = useAuth()
    const navigate = useNavigate()

    const handleLogin = async (e) => {
        e.preventDefault()
        setError('')
        setCargando(true)
        try {
            const response = await apiAxios.post('/auth/login', { email, password })
            login(response.data.token, response.data.usuario)
            navigate('/dashboard')
        } catch (err) {
            setError(err.response?.data?.message || 'Error al iniciar sesión')
        } finally {
            setCargando(false)
        }
    }

    const inputStyle = { borderRadius: '10px', padding: '10px 14px', fontSize: '0.95rem' }

    return (
        <div style={{
            minHeight: '100vh',
            background: 'linear-gradient(135deg, #fff0f3, #ffd6e0)',
            display: 'flex', alignItems: 'center', justifyContent: 'center',
            padding: '20px'
        }}>
            <style>{`
                .auth-btn {
                    background: linear-gradient(135deg, #E8A0A8, #C97A85);
                    color: white; border-radius: 10px; padding: 12px;
                    font-weight: 600; font-size: 1rem; border: none;
                    width: 100%; cursor: pointer; transition: 0.2s;
                }
                .auth-btn:hover:not(:disabled) { transform: translateY(-1px); opacity: 0.92; }
                .auth-btn:disabled { opacity: 0.7; cursor: not-allowed; }
            `}</style>

            <div style={{
                background: 'white', borderRadius: '20px',
                padding: '48px 40px', width: '100%', maxWidth: '420px',
                boxShadow: '0 20px 60px rgba(200, 100, 120, 0.15)'
            }}>
                <div className="text-center mb-4">
                    <img src={logo} alt="ReproPig" style={{ height: '90px', objectFit: 'contain', display: 'block', margin: '0 auto 8px' }} />
                    <p style={{ color: '#aaa', fontSize: '0.9rem' }}>Inicia sesión para continuar</p>
                </div>

                {error && (
                    <div className="alert alert-danger py-2 text-center mb-3" style={{ borderRadius: '10px', fontSize: '0.9rem' }}>
                        {error}
                    </div>
                )}

                <form onSubmit={handleLogin}>
                    <div className="mb-3">
                        <label className="form-label fw-semibold" style={{ color: '#555' }}>Email</label>
                        <input type="email" className="form-control" placeholder="correo@ejemplo.com"
                            value={email} onChange={e => setEmail(e.target.value)}
                            required style={inputStyle} />
                    </div>
                    <div className="mb-4">
                        <label className="form-label fw-semibold" style={{ color: '#555' }}>Contraseña</label>
                        <input type="password" className="form-control" placeholder="••••••••"
                            value={password} onChange={e => setPassword(e.target.value)}
                            required style={inputStyle} />
                    </div>
                    <button type="submit" className="auth-btn" disabled={cargando}>
                        {cargando ? 'Ingresando...' : 'Iniciar sesión'}
                    </button>
                </form>
            </div>
        </div>
    )
}