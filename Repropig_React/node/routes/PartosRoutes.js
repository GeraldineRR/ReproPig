import express from 'express'
import { getALLPartos, getPartos, createPartos, updatePartos, deletePartos } from '../controllers/PartosController.js'
import multer from 'multer'
import path from 'path'

const router = express.Router()


const almacenamiento = multer.diskStorage({
    
    destination: function (req, file, cb)  {

        cb(null, 'public/uploads')
    },

    filename: function (req, file, cb) {
        cb(null, Date.now () + path.extname(file.originalname))
    } 
})


const upload = multer({ storage: almacenamiento});
  
router.get('/', getALLPartos);
router.get('/:id', getPartos);
router.post('/',createPartos);
router.put('/:id',updatePartos)
router.delete('/:id', deletePartos);

export default router;