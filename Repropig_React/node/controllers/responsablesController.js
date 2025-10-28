import responsablesservice from '../services/responsablesService.js';

export const getAllResponsables = async (req, res) => {
    try {
        const responsables = await responsablesservice.getALL();
        res.status(200).json(responsables)

    } catch (error) {
        res.status(500).json({ message: error.message })
    }
}

export const getResponsables = async (req, res) => {
    try {

        const responsables = await responsablesservice.getById(req.params.id);
        res.status(200).json(responsables)

    } catch (error) {
        res.status(404).json({ message: error.message })

    }
}

export const createResponsables = async (req, res) => {
    try {
        
        const Responsables = await responsablesservice.create(req.body)
        res.status(201).json({message: 'Resposable Creado', Responsables})

    } catch (error) {

        res.status(400).json({ message: error.message })

    }
}

export const updateResponsables = async (req, res) => {
    try {
        await responsablesservice.update(req.params.id, req.body)
        res.status(200).json({ message: 'Resposable Actualizado correctamente' })

    } catch (error) {
        res.status(400).json({ message: error.message })

    }
}

export const deleteResponsables = async (req, res) => {
    try {
        await responsablesservice.delete(req.params.id)
        res.status(204).send()

    } catch (error) {
        res.status(400).json({ message: error.message })

    }
}