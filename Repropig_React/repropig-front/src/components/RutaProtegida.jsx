import { Navigate, Outlet } from 'react-router-dom'
import { useAuth } from '../context/AuthContext'

const RutaProtegida = ({ children, rolesPermitidos, redirectTo = '/dashboard' }) => {
    const { usuario, cargando } = useAuth()

    if (cargando) return <div className="text-center mt-5">Cargando...</div>

    if (!usuario) return <Navigate to="/" replace />

    if (rolesPermitidos && rolesPermitidos.length > 0) {
        const userCargo = (usuario.cargo || usuario.Cargo || '').toLowerCase().trim()
        const permitidos = rolesPermitidos.map(r => String(r).toLowerCase().trim())
        if (!permitidos.includes(userCargo)) {
            return <Navigate to={redirectTo} replace />
        }
    }

    return children ?? <Outlet />
}

export default RutaProtegida
