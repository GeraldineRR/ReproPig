import ActividadesCamadaModel from "../models/actividadesCamadaModel.js";

export const getAllActividades = async (req, res) => {
    try {
        const actividades = await ActividadesCamadaModel.findAll();
        res.json(actividades);
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

export const getActividad = async (req, res) => {
    try {
        const actividad = await ActividadesCamadaModel.findByPk(req.params.id);
        if (!actividad) return res.status(404).json({ message: "No encontrada" });
        res.json(actividad);
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

export const createActividad = async (req, res) => {
    try {
        const actividad = await ActividadesCamadaModel.create(req.body);
        res.status(201).json({ message: "Creada exitosamente", actividad });
    } catch (error) {
        res.status(400).json({ message: error.message });
    }
};

export const updateActividad = async (req, res) => {
    try {
        await ActividadesCamadaModel.update(req.body, { where: { Id_Actividad: req.params.id } });
        res.json({ message: "Actualizada" });
    } catch (error) {
        res.status(400).json({ message: error.message });
    }
};

export const deleteActividad = async (req, res) => {
    try {
        await ActividadesCamadaModel.destroy({ where: { Id_Actividad: req.params.id } });
        res.json({ message: "Eliminada" });
    } catch (error) {
        res.status(400).json({ message: error.message });
    }
};
