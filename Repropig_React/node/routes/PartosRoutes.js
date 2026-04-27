import express from 'express'
import { 
    getALLPartos, 
    getPartos, 
    createPartos, 
    updatePartos, 
    deletePartos,
    updateEstadoParto
} from '../controllers/PartosController.js'

import multer from 'multer'
import path from 'path'

const router = express.Router()

const almacenamiento = multer.diskStorage({
    
    destination: function (req, file, cb)  {
        cb(null, 'public/uploads')
    },

    filename: function (req, file, cb) {
        cb(null, Date.now() + path.extname(file.originalname))
    } 
})

const upload = multer({ storage: almacenamiento })

router.get('/', getALLPartos)
router.get('/:id', getPartos)
router.post('/', createPartos)

// RUTA PARA ACTIVAR/DESACTIVAR (debe ir ANTES de /:id)
router.put('/estado/:id', updateEstadoParto)

router.put('/:id', updatePartos)
router.delete('/:id', deletePartos)

export default router