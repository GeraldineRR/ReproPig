import express from 'express';
import { getAllSegcamadas, getSegcamada, createSegcamada, updateSegcamada, deleteSegcamada, getSegCamadaByCria, getNotificacionesSeguimiento } from '../controllers/segcamadaController.js';

const router = express.Router();

router.get('/', getAllSegcamadas);
router.get('/notificaciones', getNotificacionesSeguimiento);
router.get('/cria/:idCria', getSegCamadaByCria);
router.get('/:id', getSegcamada);
router.post('/', createSegcamada);
router.put('/:id', updateSegcamada);
router.delete('/:id', deleteSegcamada);

export default router;