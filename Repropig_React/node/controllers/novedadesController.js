import NovedadesModel from "../models/novedadesModel.js";

export const getAllNovedades = async (req, res) => {
    try {
        const novedades = await NovedadesModel.findAll();
        res.json(novedades);
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

export const getNovedad = async (req, res) => {
    try {
        const novedad = await NovedadesModel.findByPk(req.params.id);
        if (!novedad) return res.status(404).json({ message: "No encontrada" });
        res.json(novedad);
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

export const createNovedad = async (req, res) => {
    try {
        const novedad = await NovedadesModel.create(req.body);
        res.status(201).json({ message: "Creada exitosamente", novedad });
    } catch (error) {
        res.status(400).json({ message: error.message });
    }
};

export const updateNovedad = async (req, res) => {
    try {
        await NovedadesModel.update(req.body, { where: { Id_Novedad: req.params.id } });
        res.json({ message: "Actualizada" });
    } catch (error) {
        res.status(400).json({ message: error.message });
    }
};

export const deleteNovedad = async (req, res) => {
    try {
        await NovedadesModel.destroy({ where: { Id_Novedad: req.params.id } });
        res.json({ message: "Eliminada" });
    } catch (error) {
        res.status(400).json({ message: error.message });
    }
};
