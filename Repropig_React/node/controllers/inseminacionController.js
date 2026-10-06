import inseminacionservice from "../services/inseminacionService.js";
import inseminacionModel from "../models/inseminacionModel.js";

// obtener todas las inseminaciones
export const getAllinseminacion = async (req, res) => {
    try {
        const inseminacion = await inseminacionservice.getAll()
        res.status(200).json(inseminacion)
    } catch (error) {
        res.status(500).json({ message: error.message })
    }
}
// obtener una inseminacion por id
export const getinseminacion = async (req, res) => {
    try {
        const inseminacion = await inseminacionservice.getById(req.params.id)
        res.status(200).json(inseminacion)
    } catch (error) {
        res.status(404).json({ message: error.message })
    }
}
// crear una nueva inseminacion
export const createinseminacion = async (req, res) => {
    try {
        const inseminacion = await inseminacionservice.create(req.body)
        res.status(201).json({ message: "inseminacion creada", inseminacion })
    } catch (error) {
        res.status(400).json({ message: error.message })
    }
}

//actualizar una inseminacion
export const updateinseminacion = async (req, res) => {
    try {
        await inseminacionservice.update(req.params.id, req.body)
        res.status(200).json({ message: "inseminacion actualizada correctamente" })
    } catch (error) {
        res.status(400).json({ message: error.message })
    }
}
// eliminar una inseminacion 
export const deleteinseminacion = async (req, res) => {
    try {
        await inseminacionservice.delete(req.params.id)
        res.status(204).send()
    } catch (error) {
        res.status(400).json({ message: error.message })
    }
}

// alternar estado Activo / Inactivo
export const toggleEstadoInseminacion = async (req, res) => {
    try {
        const { id } = req.params;
        const inseminacion = await inseminacionModel.findByPk(id);
        if (!inseminacion) {
            return res.status(404).json({ message: "Inseminación no encontrada" });
        }
        inseminacion.estado = inseminacion.estado === "Activo" ? "Inactivo" : "Activo";
        await inseminacion.save();
        res.json({ message: "Estado actualizado", estado: inseminacion.estado });
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};
