import express from 'express';
import { getAllinseminacion, getinseminacion, createinseminacion, updateinseminacion, deleteinseminacion, toggleEstadoInseminacion } from '../controllers/inseminacionController.js'
import { verificarToken, soloAdmin } from '../middlewares/authMiddleware.js';

const router = express.Router()

router.get('/', getAllinseminacion);
router.get('/:id', getinseminacion);
router.post('/', createinseminacion);
router.put('/:id/toggle-estado', toggleEstadoInseminacion);
router.put('/:id', updateinseminacion);
router.delete('/:id', verificarToken, soloAdmin, deleteinseminacion);

export default router;