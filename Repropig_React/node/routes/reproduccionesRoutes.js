import express from 'express';
import {
    getAllreproducciones,
    getReproducciones,
    createreproducciones,
    updatereproducciones,
    toggleActivoReproduccion,
    deletereproducciones
} from '../controllers/reproduccionesController.js';

const router = express.Router()

router.get('/', getAllreproducciones);
router.get('/:id', getReproducciones);
router.post('/', createreproducciones);
router.put('/:id', updatereproducciones);
router.patch('/:id/toggle-activo', toggleActivoReproduccion);
router.delete('/:id', deletereproducciones);

export default router;