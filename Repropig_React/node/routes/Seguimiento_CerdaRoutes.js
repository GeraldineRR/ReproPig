import express from "express";

import {
    getAllSeguimiento_Cerda,
    getSeguimiento_Cerda,
    createSeguimiento_Cerda,
    updateSeguimiento_Cerda,
    deleteSeguimiento_Cerda,
    toggleEstadoSeguimiento_Cerda,
    getSeguimientoByParto
} from "../controllers/Seguimiento_CerdaController.js";
import { verificarToken } from "../middlewares/authMiddleware.js";

const router = express.Router();

router.use(verificarToken);

// OBTENER TODOS
router.get(
    "/",
    getAllSeguimiento_Cerda
);


// OBTENER POR PARTO / CICLO
router.get(
    "/parto/:idParto",
    getSeguimientoByParto
);


// OBTENER POR ID
router.get(
    "/:id",
    getSeguimiento_Cerda
);


// CREAR
router.post(
    "/",
    createSeguimiento_Cerda
);


// CAMBIAR ESTADO
router.put(
    "/:id/toggle-estado",
    toggleEstadoSeguimiento_Cerda
);


// ACTUALIZAR
router.put(
    "/:id",
    updateSeguimiento_Cerda
);


// ELIMINAR
router.delete(
    "/:id",
    deleteSeguimiento_Cerda
);

export default router;