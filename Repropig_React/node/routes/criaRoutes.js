import express from 'express';
import { getAllCrias, getCria, createCria, updateCria, deleteCria, obtenerCriasPorParto} from '../controllers/criaController.js';
import CriaModel from '../models/criaModel.js';

const router = express.Router()

router.get('/count/:id', async (req, res) => {
    try {
        const total = await CriaModel.count({
            where: { Id_parto: req.params.id }
        })

        res.json(total)
    } catch (error) {
        console.error("ERROR:", error)
        res.status(500).json({ error: error.message })
    }
})
router.get('/', getAllCrias);
router.get('/partos/:id', obtenerCriasPorParto);
router.get('/:id', getCria);
router.post('/', createCria);
router.put('/:id', updateCria);
router.delete('/:id', deleteCria);
export default router;