import express from 'express';
import { getAllCalendario, getCalendario, createCalendario, updateCalendario, deleteCalendario, getCalendarioByCiclo } from '../controllers/CalendarioController.js';

const router = express.Router();

router.get('/', getAllCalendario);
router.get('/ciclo/:idCiclo', getCalendarioByCiclo);
router.get('/:id', getCalendario);
router.post('/', createCalendario);
router.put('/:id', updateCalendario);
router.delete('/:id', deleteCalendario);

export default router;