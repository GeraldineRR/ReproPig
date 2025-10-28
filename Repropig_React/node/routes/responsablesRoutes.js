import express from 'express'
import { getALLResponsables, getResponsables, createResponsables, updateResponsables, delateresponsables } from '../controllers/responsableController.js'
import { createResponsables } from '../controllers/playerController';

const router = express.Router();

router.get('/', getALLResponsables);
router.get('/:id', getResponsables);
router.post('/', createResponsables);
router.put('/:id', updateResponsables);
router.delete('/:id', delateresponsables);

export default router;