import PorcinoService from "../services/porcinoService.js";
import PorcinoModel from "../models/porcinoModel.js";

export const getAllPorcinos = async (req, res) => {
    try {
        const porcinos = await PorcinoService.getAll()
        res.status(200).json(porcinos)

    } catch (error) {
        res.status(500).json({ message: error.message })
    }
}


export const getPorcino = async (req, res) => {
    try {
        const porcino = await PorcinoService.getById(req.params.id)
        res.status(200).json(porcino)

    } catch (error) {
        res.status(404).json({ message: error.message })
    }
}

export const toggleEstadoPorcino = async (req, res) => {
    try {
        const { id } = req.params;

        const porcino = await PorcinoModel.findByPk(id);

        if (!porcino) {
            return res.status(404).json({ message: "Porcino no encontrado" });
        }

        porcino.Estado = porcino.Estado === "Activo"
            ? "Inactivo"
            : "Activo";

        await porcino.save();

        res.json({
            message: "Estado actualizado",
            Estado: porcino.Estado
        });

    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};


export const createPorcino = async (req, res) => {
    try {
        const porcino = await PorcinoService.create(req.body)
        res.status(201).json({ message: 'Porcino creado', porcino })

    } catch (error) {
        res.status(400).json({ message: error.message })
    }
}


export const updatePorcino = async (req, res) => {
    try {
        await PorcinoService.update(req.params.id, req.body)
        res.status(200).json({ message: 'Porcino actualizado correctamente' })

    } catch (error) {
        res.status(400).json({ message: error.message })
    }
}


export const deletePorcino = async (req, res) => {
    try {
        await PorcinoService.delete(req.params.id)
        res.status(204).send()

    } catch (error) {
        res.status(400).json({ message: error.message })
    }
}