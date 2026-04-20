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