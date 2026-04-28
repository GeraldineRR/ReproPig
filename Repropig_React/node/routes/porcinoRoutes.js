import express from 'express';
import { getAllPorcinos, getPorcino, createPorcino, updatePorcino, deletePorcino, toggleEstadoPorcino } from '../controllers/porcinoController.js';

const router = express.Router();

router.get('/', getAllPorcinos);
router.get('/:id', getPorcino);
router.put('/:id/toggle-estado', toggleEstadoPorcino);
router.post('/', createPorcino);
router.put('/:id', updatePorcino);
router.delete('/:id', deletePorcino);

export default router;