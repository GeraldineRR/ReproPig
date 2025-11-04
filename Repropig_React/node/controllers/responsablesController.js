import responsablesservice from '../services/responsablesService.js';

export const getAllResponsables = async (req, res) => {
    try {
        const responsable = await responsablesservice.getALL();
        res.status(200).json(responsable)

    } catch (error) {
        res.status(500).json({ message: error.message })
    }
}

export const getResponsable = async (req, res) => {
    try {

        const responsable = await responsablesservice.getById(req.params.id);
        res.status(200).json(responsable)

    } catch (error) {
        res.status(404).json({ message: error.message })

    }
}

export const createResponsable = async (req, res) => {
    try {
        
        const responsable = await responsablesservice.create(req.body)
        res.status(201).json({message: 'Responsable Creado', responsable})

    } catch (error) {

        res.status(400).json({ message: error.message })

    }
}

export const updateResponsable = async (req, res) => {
    try {
        await responsablesservice.update(req.params.id, req.body)
        res.status(200).json({ message: 'Responsable Actualizado correctamente' })

    } catch (error) {
        res.status(400).json({ message: error.message })

    }
}

export const deleteResponsable = async (req, res) => {
    try {
        await responsablesservice.delete(req.params.id)
        res.status(204).send()

    } catch (error) {
        res.status(400).json({ message: error.message })

    }
}