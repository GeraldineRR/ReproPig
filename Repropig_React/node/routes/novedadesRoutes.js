import express from 'express';
import { getAllNovedades, getNovedad, createNovedad, updateNovedad, deleteNovedad } from '../controllers/novedadesController.js';

const router = express.Router();

router.get('/', getAllNovedades);
router.get('/:id', getNovedad);
router.post('/', createNovedad);
router.put('/:id', updateNovedad);
router.delete('/:id', deleteNovedad);

export default router;
