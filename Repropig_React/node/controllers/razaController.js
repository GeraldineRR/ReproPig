import RazaService from "../services/razaService.js";
import RazaModel from "../models/razaModel.js"

export const getAllRazas = async (req, res) => {
    try {
        const razas = await RazaService.getAll()
        res.status(200).json(razas)

    } catch (error) {
        res.status(500).json({ message: error.message })
    }
}


export const getRaza = async (req, res) => {
    try {
        const raza = await RazaService.getById(req.params.id)
        res.status(200).json(raza)

    } catch (error) {
        res.status(404).json({ message: error.message })
    }
}


export const toggleEstadoRaza = async (req, res) => {
    try {
        const { id } = req.params;

        const raza = await RazaModel.findByPk(id);

        if (!raza) {
            return res.status(404).json({ message: "Raza no encontrada" });
        }

        raza.Estado = raza.Estado === "Activo"
            ? "Inactivo"
            : "Activo";

        await raza.save();

        res.json({
            message: "Estado actualizado",
            Estado: raza.Estado
        });

    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};


export const createRaza = async (req, res) => {
    try {
        const raza = await RazaService.create(req.body)
        res.status(201).json({message: 'raza creada', raza})

    } catch (error) {
        res.status(400).json({ message: error.message })
    }
}


export const updateRaza = async (req, res) => {
    try {
        await RazaService.update(req.params.id, req.body)
        res.status(200).json({ message: 'raza actualizado correctamente' })

    } catch (error) {
        res.status(400).json({ message: error.message })
    }
}


export const deleteRaza = async (req, res) => {
    try {
        await RazaService.delete(req.params.id)
        res.status(204).send()

    } catch (error) {
        res.status(400).json({ message: error.message })
    }
}