import express from 'express';
import { getAllmonta, getmonta, createmonta, updatemonta, deletemonta, toggleEstadomonta } from '../controllers/montaController.js'

const router = express.Router()

router.get('/', getAllmonta);
router.get('/:id', getmonta);
router.post('/', createmonta);
router.put('/:id/toggle-estado', toggleEstadomonta);
router.put('/:id', updatemonta);
router.put('/:id/toggle-estado', toggleEstadoMonta);
router.delete('/:id', deletemonta);

export default router;