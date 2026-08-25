import express from 'express'
import { getAllResponsables, getResponsables, createResponsables, updateResponsables, deleteResponsables, cambiarContrasena } from '../controllers/responsablesController.js'
import { verificarToken, soloInstructor } from '../middlewares/authMiddleware.js'
import multer from 'multer';
import path from 'path';

const router = express.Router()

const almacenamiento = multer.diskStorage({
    destination: function (req, file, cb) {},
    filename: function (req, file, cb) {
        cb(null, Date.now() + path.extname(file.originalname))
    }
});

const Upload = multer({ storage: almacenamiento });

router.get('/', getAllResponsables)
router.get('/:id', verificarToken, soloInstructor, getResponsables)
router.post('/', verificarToken, soloInstructor, createResponsables)
router.put('/:id', verificarToken, soloInstructor, updateResponsables)
router.delete('/:id', verificarToken, soloInstructor, deleteResponsables)

router.put('/:id/cambiar-contrasena', verificarToken, cambiarContrasena)

export default router