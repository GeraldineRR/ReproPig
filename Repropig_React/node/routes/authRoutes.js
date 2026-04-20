import express from 'express'
import { login, register } from '../controllers/authController.js'
import { verificarToken, soloInstructor } from '../middlewares/authMiddleware.js'

const router = express.Router()

// ✅ Login público
router.post('/login', login)

// ✅ Registro solo para instructores autenticados
router.post('/register', verificarToken, soloInstructor, register)

export default router