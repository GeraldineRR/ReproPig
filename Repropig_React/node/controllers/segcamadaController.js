import SegcamadaService from "../services/segcamadaService.js";
import SegCamadaModel from "../models/SegCamadaModel.js";

export const getAllSegcamadas = async (req, res) => {
    try {
        const segcamadas = await SegcamadaService.getAll()
        res.status(200).json(segcamadas)

    } catch (error) {
        res.status(500).json({ message: error.message })
    }
}

export const getSegCamadaByCria = async (req, res) => {
    const { idCria } = req.params;

    try {
        const registros = await SegCamadaModel.findAll({
            where: { Id_Cria: idCria },
            order: [['Dia_Programado', 'ASC']] // importante para obtener el último día fácilmente
        });

        res.status(200).json(registros);

    } catch (error) {
        console.error("Error obteniendo registros por cría:", error);
        res.status(500).json({ error: error.message });
    }
};

export const getSegcamada = async (req, res) => {
    try {
        const segcamada = await SegcamadaService.getById(req.params.id)
        res.status(200).json(segcamada)

    } catch (error) {
        res.status(404).json({ message: error.message })
    }
}


export const createSegcamada = async (req, res) => {
    try {
        const segcamada = await SegcamadaService.create(req.body)
        res.status(201).json({message: 'Camada creada', segcamada})

    } catch (error) {
        res.status(400).json({ message: error.message })
    }
}


export const updateSegcamada = async (req, res) => {
    try {
        await SegcamadaService.update(req.params.id, req.body)
        res.status(200).json({ message: 'Camada actualizado correctamente' })

    } catch (error) {
        res.status(400).json({ message: error.message })
    }
}


export const deleteSegcamada = async (req, res) => {
    try {
        await SegcamadaService.delete(req.params.id)
        res.status(204).send()

    } catch (error) {
        res.status(400).json({ message: error.message })
    }
}