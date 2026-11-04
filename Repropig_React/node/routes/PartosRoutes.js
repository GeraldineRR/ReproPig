import express from 'express'
import { 
    getALLPartos, 
    getPartos, 
    getPartoByCiclo,
    createPartos, 
    updatePartos, 
    deletePartos,
    checkSeguimiento
} from '../controllers/PartosController.js'

import multer from 'multer'
import path from 'path'

import { verificarToken } from '../middlewares/authMiddleware.js'

const router = express.Router()

router.use(verificarToken)

router.get('/', getALLPartos)
router.get('/ciclo/:idCiclo', getPartoByCiclo)
router.get('/:id/tiene-seguimiento', checkSeguimiento)
router.get('/:id', getPartos)
router.post('/', createPartos)

router.put('/:id', updatePartos)
router.delete('/:id', deletePartos)

export default router