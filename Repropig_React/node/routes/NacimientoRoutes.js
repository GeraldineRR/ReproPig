import express from 'express'
import { getAllNacimiento, getNacimiento, createNacimiento,updateNacimiento, deleteNacimiento }from '../controllers/NacimientoController.js'

const router = express.Router()
router.get('/',getAllNacimiento);
router.get('/:id',getNacimiento);
router.post('/',createNacimiento);
router.put('/:id',updateNacimiento);
router.delete('/:id',deleteNacimiento);

export default router