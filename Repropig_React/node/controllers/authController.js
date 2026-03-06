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