import express from 'express'
import { getALLMedicamento, getMedicamento, createMedicamento, updateMedicamento, deleteMedicamento } from '../controllers/MedicamentosController.js'
import multer from 'multer'
import path from 'path'


const router = express.Router()


router.get('/', getALLMedicamento);
router.get('/:id', getMedicamento);
router.post('/', createMedicamento);
router.put('/:id', updateMedicamento);
router.delete('/:id', deleteMedicamento);

export default router;