import express from 'express';
import { getAllSegcamadas, getSegcamada, createSegcamada, updateSegcamada, deleteSegcamada, getSegCamadaByCria, toggleEstadoSegcamada } from '../controllers/segcamadaController.js';

const router = express.Router();

router.get('/', getAllSegcamadas);
router.get('/porcino/:idPorcino', getSegCamadaByPorcino);
router.get('/:id', getSegcamada);
router.post('/', createSegcamada);
router.put('/:id/toggle-estado', toggleEstadoSegcamada);
router.put('/:id', updateSegcamada);
router.delete('/:id', deleteSegcamada);

export default router;