import express from 'express';
import { getAllcolecta, getcolecta, createcolecta, updatecolecta, deletecolecta } from '../controllers/colectaController.js'

const router = express.Router()

router.get('/', getAllcolecta);
router.get('/:id', getcolecta);
router.post('/', createcolecta);
router.put('/:id', updatecolecta);
router.delete('/:id', deletecolecta);

export default router;