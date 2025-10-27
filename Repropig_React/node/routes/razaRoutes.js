import express from 'express';
import { getAllRazas, getRaza, createRaza, updateRaza, deleteRaza } from '../controllers/razaController.js';

const router = express.Router();

router.get('/', getAllRazas);
router.get('/:id', getRaza);
router.post('/', createRaza);
router.put('/:id', updateRaza);
router.delete('/:id', deleteRaza);

export default router;