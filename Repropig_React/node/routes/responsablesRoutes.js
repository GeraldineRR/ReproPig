import express from 'express'
import { getAllResponsables, getResponsables, createResponsables, updateResponsables, deleteResponsables, cambiarContrasena } from '../controllers/responsablesController.js'
import { verificarToken, soloInstructor } from '../middlewares/authMiddleware.js'

const router = express.Router()

router.get('/', verificarToken, getAllResponsables)
router.get('/:id', verificarToken, soloInstructor, getResponsables)
router.post('/', verificarToken, soloInstructor, createResponsables)
router.put('/:id', verificarToken, soloInstructor, updateResponsables)
router.delete('/:id', verificarToken, soloInstructor, deleteResponsables)

router.put('/:id/cambiar-contrasena', verificarToken, cambiarContrasena)

export default router