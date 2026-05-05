import express from 'express';
import { getAllRazas, getRaza, createRaza, updateRaza, deleteRaza, toggleEstadoRaza } from '../controllers/razaController.js';

const router = express.Router();

router.get('/', getAllRazas);
router.get('/:id', getRaza);
router.put('/:id/toggle-estado', toggleEstadoRaza);
router.post('/', createRaza);
router.put('/:id', updateRaza);
router.delete('/:id', deleteRaza);

export default router;