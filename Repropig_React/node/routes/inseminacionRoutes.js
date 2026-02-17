import express from 'express';
import { getAllinseminacion, getinseminacion, createinseminacion, updateinseminacion, deleteinseminacion } from '../controllers/inseminacionController.js'

const router = express.Router()

router.get('/', getAllinseminacion);
router.get('/:id', getinseminacion);
router.post('/', createinseminacion);
router.put('/:id', updateinseminacion);
router.delete('/:id', deleteinseminacion);

export default router;