import ciclosService from "../services/ciclosService.js";

const cleanId = (id) => String(id || '').replace(/^:+/, '')
const validateId = (id) => {
    const cleaned = cleanId(id)
    if (!/^[0-9]+$/.test(cleaned)) {
        throw new Error('Id de ciclo inválido')
    }
    return cleaned
}

// Obtener todas las ciclos
export const getAllciclos = async (req, res) => {
    try {
        const ciclos = await ciclosService.getAll()
        res.status(200).json(ciclos)
    } catch (error) {
        res.status(500).json({ message: error.message })
    }
}

// Obtener una ciclo por id
export const getCiclos = async (req, res) => {
    try {
        const id = validateId(req.params.id)
        const ciclos = await ciclosService.getById(id)
        res.status(200).json(ciclos)
    } catch (error) {
        res.status(404).json({ message: error.message })
    }
}

// Crear una nueva ciclo
export const createciclos = async (req, res) => {
    try {
        const ciclos = await ciclosService.create(req.body)
        res.status(201).json({ message: "ciclo creada", ciclos })
    } catch (error) {
        res.status(400).json({ message: error.message })
    }
}

// Actualizar una ciclo
export const updateciclos = async (req, res) => {
    try {
        const id = validateId(req.params.id)
        await ciclosService.update(id, req.body)
        res.status(200).json({ message: "ciclo actualizada correctamente" })
    } catch (error) {
        res.status(400).json({ message: error.message })
    }
}

// Activar / Inactivar una ciclo
export const toggleActivoCiclo = async (req, res) => {
    try {
        const id = validateId(req.params.id)
        const nuevoEstado = await ciclosService.toggleActivo(id)
        res.status(200).json({ message: "Estado actualizado", Activo: nuevoEstado })
    } catch (error) {
        res.status(400).json({ message: error.message })
    }
}

// Eliminar una ciclo
export const deleteciclos = async (req, res) => {
    try {
        const id = validateId(req.params.id)
        await ciclosService.delete(id)
        res.status(204).send()
    } catch (error) {
        res.status(400).json({ message: error.message })
    }
}