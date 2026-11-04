import express from 'express';
import { getAllPorcinos, getPorcino, createPorcino, updatePorcino, deletePorcino, toggleEstadoPorcino, getLechonesByParto } from '../controllers/porcinoController.js';
import { verificarToken } from '../middlewares/authMiddleware.js';

const router = express.Router();

// Ruta pública exclusiva para visualización de ficha técnica al escanear código QR en corral
router.get('/public/:id', getPorcino);

// Rutas privadas protegidas por autenticación
router.get('/', verificarToken, getAllPorcinos);
router.get('/lechones/parto/:idParto', verificarToken, getLechonesByParto);
router.get('/:id', verificarToken, getPorcino);
router.put('/:id/toggle-estado', verificarToken, toggleEstadoPorcino);
router.post('/', verificarToken, createPorcino);
router.put('/:id', verificarToken, updatePorcino);
router.delete('/:id', verificarToken, deletePorcino);

export default router;