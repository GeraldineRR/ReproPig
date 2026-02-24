import express from 'express'
import { getAllResponsables, getResponsables, createResponsables, updateResponsables, deleteResponsables } from '../controllers/responsablesController.js'

const router = express.Router()

router.get('/', getAllResponsables)
router.get('/:id', getResponsables)
router.post('/', createResponsables)
router.put('/:id', updateResponsables)
router.delete('/:id', deleteResponsables)

export default router