import express from 'express';
import { getAllSeguimiento_Cerda, getSeguimiento_Cerda, createSeguimiento_Cerda, updateSeguimiento_Cerda, deleteSeguimiento_Cerda } from '../controllers/Seguimiento_CerdaController.js';

const router = express.Router();

router.get('/', getAllSeguimiento_Cerda);
router.get('/:id', getSeguimiento_Cerda);
router.post('/', createSeguimiento_Cerda);
router.put('/:id', updateSeguimiento_Cerda);
router.delete('/:id', deleteSeguimiento_Cerda);

export default router;