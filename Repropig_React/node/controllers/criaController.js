import CriaService from "../services/criaService.js";

export const getAllCrias = async (req, res) => {
    try {
        const crias = await CriaService.getAll()
        res.status(200).json(crias)

    } catch (error) {
        res.status(500).json({ message: error.message })
    }
}

export const getCria = async (req, res) => {
    try {
        const cria = await CriaService.getById(req.params.id)
        res.status(200).json(cria)

    } catch (error) {
        res.status(404).json({ message: error.message })
    }
}

export const obtenerCriasPorParto = async (req, res) => {
    const { id } = req.params

    try {
        const crias = await CriaService.getCriasByParto(id)
        res.json(crias)
    } catch (error) {
        res.status(500).json({ error: 'Error' })
    }
}

export const createCria = async (req, res) => {
    try {
        const cria = await CriaService.create(req.body)
        res.status(201).json({ message: 'cria creada', cria })

    } catch (error) {
        res.status(400).json({ message: error.message })
    }
}

export const updateCria = async (req, res) => {
    try {
        await CriaService.update(req.params.id, req.body)
        res.status(200).json({ message: 'cria actualizada correctamente' })

    } catch (error) {
        res.status(400).json({ message: error.message })
    }
}


export const deleteCria = async (req, res) => {
    try {
        await CriaService.delete(req.params.id)
        res.status(204).send()

    } catch (error) {
        res.status(400).json({ message: error.message })
    }
}