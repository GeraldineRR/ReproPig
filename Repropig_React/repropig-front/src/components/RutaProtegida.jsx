import { Navigate } from 'react-router-dom'
import { useAuth } from '../context/AuthContext'

const RutaProtegida = ({ children, rolesPermitidos }) => {
    const { usuario, cargando } = useAuth()

    if (cargando) return <div className="text-center mt-5">Cargando...</div>

    if (!usuario) return <Navigate to="/" replace />

    // 🔐 validación de roles (nuevo)
    if (rolesPermitidos && !rolesPermitidos.includes(usuario.cargo)) {
        return <Navigate to="/dashboard" replace />
    }

    return children
}

export default RutaProtegida