import { Navigate } from 'react-router-dom'
import { useAuth } from '../../context/AuthContext'

// Protege rutas que requieren login
const RutaProtegida = ({ children }) => {
    const { usuario, cargando } = useAuth()

    if (cargando) return <div className="text-center mt-5">Cargando...</div>
    if (!usuario) return <Navigate to="/login" replace />

    return children
}

export default RutaProtegida
