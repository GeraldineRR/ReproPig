import express from 'express';
import { getAllmonta, getmonta, createmonta, updatemonta, deletemonta, toggleEstadoMonta } from '../controllers/montaController.js'
import { verificarToken } from '../middlewares/authMiddleware.js';

const router = express.Router()

router.use(verificarToken);

router.get('/', getAllmonta);
router.get('/:id', getmonta);
router.post('/', createmonta);
router.put('/:id/toggle-estado', toggleEstadoMonta);
router.put('/:id', updatemonta);
router.delete('/:id', deletemonta);

export default router;