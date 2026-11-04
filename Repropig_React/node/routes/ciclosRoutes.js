import express from 'express';
import {
    getAllciclos,
    getCiclos,
    createciclos,
    updateciclos,
    toggleActivoCiclo,
    deleteciclos
} from '../controllers/ciclosController.js';
import { verificarToken } from '../middlewares/authMiddleware.js';

const router = express.Router()

router.use(verificarToken);

router.get('/', getAllciclos);
router.get('/:id', getCiclos);
router.post('/', createciclos);
router.put('/:id', updateciclos);
router.patch('/:id/toggle-activo', toggleActivoCiclo);
router.delete('/:id', deleteciclos);

export default router;