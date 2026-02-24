import Seguimiento_CerdaService from "../services/Seguimiento_CerdaService.js";

export const getAllSeguimiento_Cerda = async (req, res) => {
    try {
        const Seguimiento_Cerda = await Seguimiento_CerdaService.getAll()
        res.status(200).json(Seguimiento_Cerda)

    } catch (error) {
        res.status(500).json({ message: error.message })
    }
}


export const getSeguimiento_Cerda = async (req, res) => {
    try {
        const Seguimiento_Cerda = await Seguimiento_CerdaService.getById(req.params.id)
        res.status(200).json(Seguimiento_Cerda)

    } catch (error) {
        res.status(404).json({ message: error.message })
    }
}

    
export const createSeguimiento_Cerda = async (req, res) => {
    try {
        const Seguimiento_Cerda = await Seguimiento_CerdaService.create(req.body)
        res.status(201).json({message: 'Seguimiento de cerda creado', Seguimiento_Cerda})

    } catch (error) {
        res.status(400).json({ message: error.message })
    }
}


export const updateSeguimiento_Cerda = async (req, res) => {
    try {
        await Seguimiento_CerdaService.update(req.params.id, req.body)
        res.status(200).json({ message: 'Seguimiento de cerda actualizado correctamente' })

    } catch (error) {
        res.status(400).json({ message: error.message })
    }
}


export const deleteSeguimiento_Cerda = async (req, res) => {
    try {
        await Seguimiento_CerdaService.delete(req.params.id)
        res.status(204).send()

    } catch (error) {
        res.status(400).json({ message: error.message })
    }
}