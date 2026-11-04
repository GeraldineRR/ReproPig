import jwt from 'jsonwebtoken'

const getJwtSecret = () => {
    const secret = process.env.JWT_SECRET
    if (!secret) {
        if (process.env.NODE_ENV === 'production') {
            throw new Error('FATAL: JWT_SECRET no está configurado en las variables de entorno.')
        }
        return 'repropig_sena_la_granja_secret_token_secure_2026_98374'
    }
    return secret
}

export const verificarToken = (req, res, next) => {
    const authHeader = req.headers['authorization'] || req.headers['Authorization']
    const token = authHeader && authHeader.split(' ')[1]

    if (!token) {
        return res.status(401).json({
            success: false,
            message: 'Acceso no autorizado: Token de autenticación requerido'
        })
    }

    try {
        const decoded = jwt.verify(token, getJwtSecret())
        req.usuario = decoded
        next()
    } catch (error) {
        const isExpired = error.name === 'TokenExpiredError'
        return res.status(401).json({
            success: false,
            message: isExpired ? 'La sesión ha expirado. Por favor ingresa nuevamente.' : 'Token inválido o corrupto',
            expired: isExpired
        })
    }
}

// ✅ Middleware RBAC flexible: permite uno o más roles (case-insensitive)
export const autorizarRoles = (...rolesPermitidos) => {
    const rolesNormalizados = rolesPermitidos.map(r => String(r).toLowerCase().trim())
    return (req, res, next) => {
        if (!req.usuario) {
            return res.status(401).json({
                success: false,
                message: 'Usuario no autenticado'
            })
        }

        const cargoUsuario = String(req.usuario.cargo || '').toLowerCase().trim()

        if (!rolesNormalizados.includes(cargoUsuario)) {
            return res.status(403).json({
                success: false,
                message: `Acceso denegado: Se requiere rol de [${rolesPermitidos.join(', ')}]. Tu rol actual es: ${req.usuario.cargo || 'Sin Rol'}`
            })
        }

        next()
    }
}

// Compatibilidad hacia atrás
export const soloInstructor = autorizarRoles('Instructor')