import express from 'express'
import { login, register, forgotPassword, resetPassword } from '../controllers/authController.js'

const router = express.Router()

router.post('/login', login)
router.post('/register', register)

// Recuperación de contraseña
router.post('/forgot-password', forgotPassword)   // envía el correo
router.post('/reset-password', resetPassword)     // cambia la contraseña

export default router