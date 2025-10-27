import express from 'express'
import { getALLPartos, getPartos, createPartos, updatePartos, deletePartos } from '../controllers/PartosController.js'

const router = express.Router()

router.get('/', getALLPartos);
router.get('/:id', getPartos);
router.post('/', createPartos);
router.put('/:id', updatePartos);
router.delete('/:id', deletePartos);

export default router;