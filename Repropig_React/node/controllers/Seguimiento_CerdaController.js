import Seguimiento_CerdaService
    from "../services/Seguimiento_CerdaService.js";

import Seguimiento_CerdaModel
    from "../models/Seguimiento_CerdaModel.js";


// ==========================================
// OBTENER TODOS
// ==========================================
export const getAllSeguimiento_Cerda = async (req, res) => {

    try {

        const Seguimiento_Cerda =
            await Seguimiento_CerdaService.getAll();

        res.status(200).json(
            Seguimiento_Cerda
        );

    } catch (error) {

        console.error(
            "ERROR GET Seguimiento_Cerda:",
            error
        );

        res.status(500).json({
            message:
                "Error al obtener los seguimientos de cerda",
            error: error.message
        });
    }
};


// ==========================================
// OBTENER UNO
// ==========================================
export const getSeguimiento_Cerda = async (
    req,
    res
) => {

    try {

        const Seguimiento_Cerda =
            await Seguimiento_CerdaService.getById(
                req.params.id
            );

        res.status(200).json(
            Seguimiento_Cerda
        );

    } catch (error) {

        console.error(
            "ERROR GET BY ID:",
            error
        );

        res.status(404).json({
            message: error.message
        });
    }
};


// ==========================================
// CREAR
// ==========================================
export const createSeguimiento_Cerda = async (
    req,
    res
) => {

    try {

        const Seguimiento_Cerda =
            await Seguimiento_CerdaService.create(
                req.body
            );

        res.status(201).json({
            message:
                "Seguimiento de cerda creado correctamente",

            Seguimiento_Cerda
        });

    } catch (error) {

        console.error(
            "ERROR CREATE:",
            error
        );

        res.status(400).json({
            message: error.message
        });
    }
};


// ==========================================
// ACTUALIZAR
// ==========================================
export const updateSeguimiento_Cerda = async (
    req,
    res
) => {

    try {

        const Seguimiento_Cerda =
            await Seguimiento_CerdaService.update(
                req.params.id,
                req.body
            );

        res.status(200).json({
            message:
                "Seguimiento de cerda actualizado correctamente",

            Seguimiento_Cerda
        });

    } catch (error) {

        console.error(
            "ERROR UPDATE:",
            error
        );

        res.status(400).json({
            message: error.message
        });
    }
};


// ==========================================
// ELIMINAR
// ==========================================
export const deleteSeguimiento_Cerda = async (
    req,
    res
) => {

    try {

        await Seguimiento_CerdaService.delete(
            req.params.id
        );

        res.status(200).json({
            message:
                "Seguimiento de cerda eliminado correctamente"
        });

    } catch (error) {

        console.error(
            "ERROR DELETE:",
            error
        );

        res.status(400).json({
            message: error.message
        });
    }
};


// ==========================================
// OBTENER POR PARTO / CICLO
// ==========================================
export const getSeguimientoByParto = async (
    req,
    res
) => {

    try {

        const registros =
            await Seguimiento_CerdaService.getByParto(
                req.params.idParto
            );

        res.status(200).json(
            registros
        );

    } catch (error) {

        console.error(
            "ERROR GET BY PARTO:",
            error
        );

        res.status(500).json({
            message: error.message
        });
    }
};


// ==========================================
// CAMBIAR ESTADO
// ==========================================
export const toggleEstadoSeguimiento_Cerda = async (
    req,
    res
) => {

    try {

        const { id } = req.params;

        const seguimiento =
            await Seguimiento_CerdaModel.findByPk(id);

        if (!seguimiento) {

            return res.status(404).json({
                message:
                    "Seguimiento de cerda no encontrado"
            });
        }

        const nuevoEstado =
            seguimiento.Estado === "Activo"
                ? "Inactivo"
                : "Activo";

        seguimiento.Estado = nuevoEstado;

        await seguimiento.save();

        res.status(200).json({

            message:
                "Estado del seguimiento actualizado",

            estado:
                seguimiento.Estado
        });

    } catch (error) {

        console.error(
            "ERROR TOGGLE ESTADO:",
            error
        );

        res.status(500).json({
            message: error.message
        });
    }
};