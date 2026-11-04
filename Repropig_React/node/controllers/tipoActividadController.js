import TipoActividadService from "../services/tipoActividadService.js";

export const getAllTipos = async (req, res) => {
    try {
        const tipos = await TipoActividadService.getAll();
        res.status(200).json(tipos);
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

export const getTipo = async (req, res) => {
    try {
        const tipo = await TipoActividadService.getById(req.params.id);
        res.status(200).json(tipo);
    } catch (error) {
        res.status(404).json({ message: error.message });
    }
};

export const createTipo = async (req, res) => {
    try {
        const tipo = await TipoActividadService.create(req.body);
        res.status(201).json({ message: "Tipo de actividad creado correctamente", tipo });
    } catch (error) {
        res.status(400).json({ message: error.message });
    }
};

export const updateTipo = async (req, res) => {
    try {
        const tipo = await TipoActividadService.update(req.params.id, req.body);
        res.status(200).json({ message: "Tipo de actividad actualizado correctamente", tipo });
    } catch (error) {
        res.status(400).json({ message: error.message });
    }
};

export const toggleEstadoTipo = async (req, res) => {
    try {
        const tipo = await TipoActividadService.toggleEstado(req.params.id);
        res.status(200).json({ message: "Estado actualizado", Estado: tipo.Estado });
    } catch (error) {
        res.status(400).json({ message: error.message });
    }
};

export const deleteTipo = async (req, res) => {
    try {
        await TipoActividadService.delete(req.params.id);
        res.status(204).send();
    } catch (error) {
        res.status(400).json({ message: error.message });
    }
};
