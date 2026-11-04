import express from 'express'
import { getALLMedicamento, getMedicamento, createMedicamento, updateMedicamento, deleteMedicamento, toggleEstadoMedicamento } from '../controllers/MedicamentosController.js'
import { verificarToken } from '../middlewares/authMiddleware.js'

const router = express.Router()

router.use(verificarToken)

router.get('/', getALLMedicamento);
router.get('/:id', getMedicamento);
router.post('/', createMedicamento);
router.put('/:id/toggle-estado', toggleEstadoMedicamento);
router.put('/:id', updateMedicamento);
router.delete('/:id', deleteMedicamento);

export default router;