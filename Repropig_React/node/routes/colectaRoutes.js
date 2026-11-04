import express from 'express';
import { getAllcolecta, getcolecta, createcolecta, updatecolecta, deletecolecta, toggleEstadocolecta } from '../controllers/colectaController.js'
import { verificarToken } from '../middlewares/authMiddleware.js';

const router = express.Router()

router.use(verificarToken);

router.get('/', getAllcolecta);
router.get('/:id', getcolecta);
router.post('/', createcolecta);
router.put('/:id/toggle-estado', toggleEstadocolecta);
router.put('/:id', updatecolecta);
router.delete('/:id', deletecolecta);

export default router;