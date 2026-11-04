import express from 'express';
import { getAllNovedades, getNovedad, createNovedad, updateNovedad, deleteNovedad } from '../controllers/novedadesController.js';
import { verificarToken } from '../middlewares/authMiddleware.js';

const router = express.Router();

router.use(verificarToken);

router.get('/', getAllNovedades);
router.get('/:id', getNovedad);
router.post('/', createNovedad);
router.put('/:id', updateNovedad);
router.delete('/:id', deleteNovedad);

export default router;
