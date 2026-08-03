import express from 'express';
import { getAllActividades, getActividad, createActividad, updateActividad, deleteActividad } from '../controllers/actividadesCamadaController.js';

const router = express.Router();

router.get('/', getAllActividades);
router.get('/:id', getActividad);
router.post('/', createActividad);
router.put('/:id', updateActividad);
router.delete('/:id', deleteActividad);

export default router;
