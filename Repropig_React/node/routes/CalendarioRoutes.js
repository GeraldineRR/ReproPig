import express from 'express';
import { getAllCalendario, getCalendario, createCalendario, updateCalendario, deleteCalendario } from '../controllers/CalendarioController.js';

const router = express.Router();

router.get('/', getAllCalendario);
router.get('/:id', getCalendario);
router.post('/', createCalendario);
router.put('/:id', updateCalendario);
router.delete('/:id', deleteCalendario);

export default router;