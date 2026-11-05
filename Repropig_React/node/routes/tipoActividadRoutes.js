import express from "express";
import {
    getAllTipos,
    getTipo,
    createTipo,
    updateTipo,
    toggleEstadoTipo,
    deleteTipo
} from "../controllers/tipoActividadController.js";
import { verificarToken } from "../middlewares/authMiddleware.js";

const router = express.Router();

router.use(verificarToken);

router.get("/", getAllTipos);
router.get("/:id", getTipo);
router.post("/", createTipo);
router.put("/:id", updateTipo);
router.put("/:id/toggle-estado", toggleEstadoTipo);
router.delete("/:id", deleteTipo);

export default router;
