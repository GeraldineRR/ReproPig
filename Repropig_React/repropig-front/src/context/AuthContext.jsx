import { createContext, useContext, useState, useEffect } from 'react'

const AuthContext = createContext()

export const AuthProvider = ({ children }) => {
    const [usuario, setUsuario] = useState(null)
    const [token, setToken] = useState(null)
    const [cargando, setCargando] = useState(true)

    useEffect(() => {
        // Recuperar sesión guardada
        const tokenGuardado = sessionStorage.getItem('token')
        const usuarioGuardado = sessionStorage.getItem('usuario')
        if (tokenGuardado && usuarioGuardado) {
            setToken(tokenGuardado)
            setUsuario(JSON.parse(usuarioGuardado))
        }
        setCargando(false)
    }, [])

    const login = (tokenNuevo, usuarioNuevo) => {
        setToken(tokenNuevo)
        setUsuario(usuarioNuevo)
        sessionStorage.setItem('token', tokenNuevo)
        sessionStorage.setItem('usuario', JSON.stringify(usuarioNuevo))
    }

    const logout = () => {
        setToken(null)
        setUsuario(null)
        sessionStorage.removeItem('token')
        sessionStorage.removeItem('usuario')
    }

    return (
        <AuthContext.Provider value={{ usuario, token, login, logout, cargando }}>
            {children}
        </AuthContext.Provider>
    )
}

export const useAuth = () => useContext(AuthContext)
