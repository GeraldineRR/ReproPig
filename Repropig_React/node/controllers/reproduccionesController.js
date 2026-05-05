import reproduccionesService from "../services/reproduccionesService.js";

// Obtener todas las reproducciones
export const getAllreproducciones = async (req, res) => {
    try {
        const reproducciones = await reproduccionesService.getAll()
        res.status(200).json(reproducciones)
    } catch (error) {
        res.status(500).json({ message: error.message })
    }
}

// Obtener una reproduccion por id
export const getReproducciones = async (req, res) => {
    console.log(req.params.id)
    try {
        const reproducciones = await reproduccionesService.getById(req.params.id)
        res.status(200).json(reproducciones)
    } catch (error) {
        res.status(404).json({ message: error.message })
    }
}

// Crear una nueva reproduccion
export const createreproducciones = async (req, res) => {
    try {
        const reproducciones = await reproduccionesService.create(req.body)
        res.status(201).json({ message: "reproduccion creada", reproducciones })
    } catch (error) {
        res.status(400).json({ message: error.message })
    }
}

// Actualizar una reproduccion
export const updatereproducciones = async (req, res) => {
    try {
        await reproduccionesService.update(req.params.id, req.body)
        res.status(200).json({ message: "reproduccion actualizada correctamente" })
    } catch (error) {
        res.status(400).json({ message: error.message })
    }
}

// Activar / Inactivar una reproduccion
export const toggleActivoReproduccion = async (req, res) => {
    try {
        const nuevoEstado = await reproduccionesService.toggleActivo(req.params.id)
        res.status(200).json({ message: "Estado actualizado", Activo: nuevoEstado })
    } catch (error) {
        res.status(400).json({ message: error.message })
    }
}

// Eliminar una reproduccion
export const deletereproducciones = async (req, res) => {
    try {
        await reproduccionesService.delete(req.params.id)
        res.status(204).send()
    } catch (error) {
        res.status(400).json({ message: error.message })
    }
}