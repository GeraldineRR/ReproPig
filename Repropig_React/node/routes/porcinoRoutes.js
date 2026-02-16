import express from 'express'
import { getAllPorcinos, getPorcino, createPorcino, updatePorcino, deletePorcino } from '../controllers/porcinoController.js'
import multer from 'multer'
import path from 'path'

const router = express.Router();

const almacenamiento = multer.diskStorage({

    destination: (req, file, cb) => {
        cb(null, 'public/uploads/')
    },

    filename: (req, file, cb) => {
        cb(null, Date.now() + path.extname(file.originalname))
    }

})

const upload = multer({ almacenamiento })

router.get('/', getAllPorcinos);
router.get('/:id', getPorcino);
router.post('/', upload.single('foto'), createPorcino);
router.put('/:id', upload.single('foto'), updatePorcino);
router.delete('/:id', deletePorcino);

export default router;