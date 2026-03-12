import { useState, useEffect } from 'react'
import { useSearchParams } from 'react-router-dom'
import { useNavigate } from 'react-router-dom'
import apiAxios from '../api/axiosConfig'
import { useAuth } from '../context/AuthContext'
import logo from '../assets/logo.png'

export default function Login() {
    const [modo, setModo] = useState('login') // 'login' | 'register'
    const [animando, setAnimando] = useState(false)
    const [error, setError] = useState('')
    const [cargando, setCargando] = useState(false)
    const { login } = useAuth()
    const navigate = useNavigate()
    const [searchParams] = useSearchParams()

    useEffect(() => {
        const modo = searchParams.get('modo')
        if (modo === 'register') cambiarModo('register')
        else cambiarModo('login')
    }, [searchParams])

    // Login form
    const [email, setEmail] = useState('')
    const [password, setPassword] = useState('')

    // Register form
    const [form, setForm] = useState({
        Nombres: '', Apellidos: '', Documento: '',
        Cargo: '', Telefono: '', Email: '', Password: '', confirmar: ''
    })

    const cambiarModo = (nuevoModo) => {
        setAnimando(true)
        setError('')
        setTimeout(() => {
            setModo(nuevoModo)
            setAnimando(false)
        }, 300)
    }

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

    const handleRegister = async (e) => {
        e.preventDefault()
        setError('')
        if (form.Password !== form.confirmar) return setError('Las contraseñas no coinciden')
        if (form.Password.length < 6) return setError('Mínimo 6 caracteres')
        setCargando(true)
        try {
            const { confirmar, ...datos } = form
            await apiAxios.post('/auth/register', datos)
            setError('')
            cambiarModo('login')
        } catch (err) {
            setError(err.response?.data?.message || 'Error al registrarse')
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
                .auth-card {
                    transition: opacity 0.3s ease, transform 0.3s ease;
                }
                .auth-card.animando {
                    opacity: 0;
                    transform: translateY(16px) scale(0.98);
                }
                .auth-card.visible {
                    opacity: 1;
                    transform: translateY(0) scale(1);
                }
                .toggle-link {
                    color: #C97A85;
                    font-weight: 600;
                    cursor: pointer;
                    background: none;
                    border: none;
                    padding: 0;
                    text-decoration: underline;
                    font-size: inherit;
                }
                .toggle-link:hover { opacity: 0.75; }
                .auth-btn {
                    background: linear-gradient(135deg, #E8A0A8, #C97A85);
                    color: white; border-radius: 10px; padding: 12px;
                    font-weight: 600; font-size: 1rem; border: none;
                    width: 100%; cursor: pointer; transition: 0.2s;
                }
                .auth-btn:hover:not(:disabled) { transform: translateY(-1px); opacity: 0.92; }
                .auth-btn:disabled { opacity: 0.7; cursor: not-allowed; }
            `}</style>

            <div className={`auth-card ${animando ? 'animando' : 'visible'}`} style={{
                background: 'white', borderRadius: '20px',
                padding: modo === 'login' ? '48px 40px' : '36px 40px',
                width: '100%', maxWidth: modo === 'login' ? '420px' : '500px',
                boxShadow: '0 20px 60px rgba(200, 100, 120, 0.15)'
            }}>
                {/* Header */}
                <div className="text-center mb-4">
                    <img src={logo} alt="ReproPig" style={{ height: '90px', objectFit: 'contain', marginBottom: '8px', display: 'block', margin: '0 auto 8px' }} />
                    <p style={{ color: '#aaa', fontSize: '0.9rem' }}>
                        {modo === 'login' ? 'Inicia sesión para continuar' : 'Crea tu cuenta'}
                    </p>
                </div>

                {error && (
                    <div className="alert alert-danger py-2 text-center mb-3" style={{ borderRadius: '10px', fontSize: '0.9rem' }}>
                        {error}
                    </div>
                )}

                {/* LOGIN */}
                {modo === 'login' && (
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
                        <p className="text-center mt-3 mb-0" style={{ color: '#999', fontSize: '0.9rem' }}>
                            ¿No tienes cuenta?{' '}
                            <button type="button" className="toggle-link" onClick={() => cambiarModo('register')}>
                                Regístrate aquí
                            </button>
                        </p>
                    </form>
                )}

                {/* REGISTER */}
                {modo === 'register' && (
                    <form onSubmit={handleRegister}>
                        <div className="row">
                            <div className="col-6 mb-3">
                                <label className="form-label fw-semibold" style={{ color: '#555' }}>Nombres</label>
                                <input type="text" className="form-control" value={form.Nombres}
                                    onChange={e => setForm({ ...form, Nombres: e.target.value })}
                                    required style={inputStyle} />
                            </div>
                            <div className="col-6 mb-3">
                                <label className="form-label fw-semibold" style={{ color: '#555' }}>Apellidos</label>
                                <input type="text" className="form-control" value={form.Apellidos}
                                    onChange={e => setForm({ ...form, Apellidos: e.target.value })}
                                    required style={inputStyle} />
                            </div>
                        </div>
                        <div className="row">
                            <div className="col-6 mb-3">
                                <label className="form-label fw-semibold" style={{ color: '#555' }}>Documento</label>
                                <input type="text" className="form-control" value={form.Documento}
                                    onChange={e => setForm({ ...form, Documento: e.target.value })}
                                    required style={inputStyle} />
                            </div>
                            <div className="col-6 mb-3">
                                <label className="form-label fw-semibold" style={{ color: '#555' }}>Cargo</label>
                                <select className="form-select" value={form.Cargo}
                                    onChange={e => setForm({ ...form, Cargo: e.target.value })}
                                    required style={inputStyle}>
                                    <option value="">Seleccione</option>
                                    <option value="Gestor">Gestor</option>
                                    <option value="Instructor">Instructor</option>
                                    <option value="Pasante">Pasante</option>
                                </select>
                            </div>
                        </div>
                        <div className="row">
                            <div className="col-6 mb-3">
                                <label className="form-label fw-semibold" style={{ color: '#555' }}>Teléfono</label>
                                <input type="text" className="form-control" value={form.Telefono}
                                    onChange={e => setForm({ ...form, Telefono: e.target.value })}
                                    style={inputStyle} />
                            </div>
                            <div className="col-6 mb-3">
                                <label className="form-label fw-semibold" style={{ color: '#555' }}>Email</label>
                                <input type="email" className="form-control" value={form.Email}
                                    onChange={e => setForm({ ...form, Email: e.target.value })}
                                    required style={inputStyle} />
                            </div>
                        </div>
                        <div className="row">
                            <div className="col-6 mb-3">
                                <label className="form-label fw-semibold" style={{ color: '#555' }}>Contraseña</label>
                                <input type="password" className="form-control" value={form.Password}
                                    placeholder="Mín. 6 caracteres"
                                    onChange={e => setForm({ ...form, Password: e.target.value })}
                                    required style={inputStyle} />
                            </div>
                            <div className="col-6 mb-3">
                                <label className="form-label fw-semibold" style={{ color: '#555' }}>Confirmar</label>
                                <input type="password" className="form-control" value={form.confirmar}
                                    placeholder="••••••••"
                                    onChange={e => setForm({ ...form, confirmar: e.target.value })}
                                    required style={inputStyle} />
                            </div>
                        </div>
                        <button type="submit" className="auth-btn" disabled={cargando}>
                            {cargando ? 'Registrando...' : 'Crear cuenta'}
                        </button>
                        <p className="text-center mt-3 mb-0" style={{ color: '#999', fontSize: '0.9rem' }}>
                            ¿Ya tienes cuenta?{' '}
                            <button type="button" className="toggle-link" onClick={() => cambiarModo('login')}>
                                Inicia sesión
                            </button>
                        </p>
                    </form>
                )}
            </div>
        </div>
    )
}