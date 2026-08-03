import authService from '../services/authService.js'

export const login = async (req, res) => {
    try {
        const { email, password } = req.body
        if (!email || !password)
            return res.status(400).json({ message: 'Email y contraseña son requeridos' })
        const resultado = await authService.login(email, password)
        res.status(200).json(resultado)
    } catch (error) {
        res.status(401).json({ message: error.message })
    }
}

export const register = async (req, res) => {
    try {
        const resultado = await authService.register(req.body)
        res.status(201).json(resultado)
    } catch (error) {
        res.status(400).json({ message: error.message })
    }
}

// Recibe el email y despacha el correo con el enlace
export const forgotPassword = async (req, res) => {
    try {
        const { email } = req.body
        if (!email)
            return res.status(400).json({ message: 'El email es requerido' })

        await authService.forgotPassword(email)

        // Siempre respondemos 200 para no revelar si el email existe o no
        res.status(200).json({
            message: 'Si ese correo está registrado, recibirás un enlace en breve.'
        })
    } catch (error) {
        console.error("ERROR forgotPassword:", error)

        res.status(500).json({
            message: error.message
        })
    }
}

// Recibe el token (desde la URL) y la nueva contraseña
export const resetPassword = async (req, res) => {
    try {
        const { token } = req.query   // viene como ?token=xxx en la URL del correo
        const { password } = req.body

        await authService.resetPassword(token, password)

        res.status(200).json({ message: 'Contraseña actualizada exitosamente.' })
    } catch (error) {
        res.status(400).json({ message: error.message })
    }
}