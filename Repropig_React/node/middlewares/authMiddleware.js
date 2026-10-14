import jwt from 'jsonwebtoken'

export const verificarToken = (req, res, next) => {
    const authHeader = req.headers['authorization']
    const token = authHeader && authHeader.split(' ')[1]

    if (!token)
        return res.status(401).json({ message: 'Token requerido' })

    try {
        const decoded = jwt.verify(token, process.env.JWT_SECRET || 'repropig_secret_2024')
        req.usuario = decoded
        next()
    } catch (error) {
        return res.status(403).json({ message: 'Token inválido o expirado' })
    }
}

// ✅ Solo instructores pueden acceder
export const soloInstructor = (req, res, next) => {
    if (req.usuario?.cargo !== 'Instructor')
        return res.status(403).json({ message: 'Solo los instructores pueden realizar esta acción' })
    next()
}

// ✅ Solo administradores pueden eliminar montas e inseminaciones
export const soloAdmin = (req, res, next) => {
    const cargo = (req.usuario?.cargo || '').toLowerCase()
    const email = (req.usuario?.email || '').toLowerCase()
    const nombres = (req.usuario?.nombres || '').toLowerCase()
    const esAdmin = cargo === 'instructor' || cargo === 'administrador' || cargo === 'admin' || email.includes('admin') || nombres.includes('admin')
    if (!esAdmin) {
        return res.status(403).json({ message: 'Solo los administradores pueden eliminar registros de montas e inseminaciones' })
    }
    next()
}