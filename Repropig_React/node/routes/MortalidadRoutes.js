import express from 'express'
import { getALLMortalidad, getMortalidad, createMortalidad, updateMortalidad, deleteMortalidad } from '../controllers/MortalidadController.js'

const router = express.Router()

router.get('/', getALLMortalidad);
router.get('/:id', getMortalidad);
router.post('/', createMortalidad);
router.put('/:id', updateMortalidad);
router.delete('/:id', deleteMortalidad);

export default router;