import express from 'express'
import { getAllResponsables, getResponsables, createResponsables, updateResponsables, deleteResponsables } from '../controllers/responsablesController.js'
import multer from 'multer';
import path from 'path';

const router = express.Router()

const almacenamiento = multer.diskStorage({

    destination: function (req, file, cb) {



    },

    filename: function (req, file, cb) {
        cb(null, Date.now() + path.extname(file.originalname))
    }
});

const Upload = multer({ storage: almacenamiento });

router.get('/', getAllResponsables)
router.get('/:id', getResponsables)
router.post('/',  createResponsables)
router.put('/:id',  updateResponsables)
router.delete('/:id', deleteResponsables)

export default router