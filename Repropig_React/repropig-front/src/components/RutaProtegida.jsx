import { Navigate, Outlet } from 'react-router-dom'
import { useAuth } from '../context/AuthContext'

const RutaProtegida = ({ children, rolesPermitidos, redirectTo = '/dashboard' }) => {
    const { usuario, cargando } = useAuth()

    if (cargando) return <div className="text-center mt-5">Cargando...</div>

    if (!usuario) return <Navigate to="/" replace />

    if (rolesPermitidos && !rolesPermitidos.includes(usuario.cargo)) {
        return <Navigate to={redirectTo} replace />
    }

    return children ?? <Outlet />
}

export default RutaProtegida