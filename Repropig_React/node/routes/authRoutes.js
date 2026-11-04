import express from 'express'
import { login, register, forgotPassword, resetPassword } from '../controllers/authController.js'
import { authRateLimiter } from '../middlewares/rateLimitMiddleware.js'
import { verificarToken, soloInstructor } from '../middlewares/authMiddleware.js'

const router = express.Router()

router.post('/login', authRateLimiter, login)

// Solo instructores autenticados pueden registrar nuevos usuarios en el sistema
router.post('/register', verificarToken, soloInstructor, register)

// Recuperación de contraseña con límite de tasa para evitar abuso de correo
router.post('/forgot-password', authRateLimiter, forgotPassword)
router.post('/reset-password', authRateLimiter, resetPassword)

export default router