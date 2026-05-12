import CalendarioModel from "../models/CalendarioModel.js";
import CalendarioService from "../services/CalendarioService.js";

export const getAllCalendario = async (req, res) => {
    try {
        const Calendario = await CalendarioService.getAll()
        res.status(200).json(Calendario)

    } catch (error) {
        res.status(500).json({ message: error.message })
    }
}

export const getCalendario = async (req, res) => {
    try {
        const Calendario = await CalendarioService.getById(req.params.id)
        res.status(200).json(Calendario)

    } catch (error) {
        res.status(404).json({ message: error.message })
    }
}

export const createCalendario = async (req, res) => {
    try {
        const { Id_Reproduccion } = req.body

        if (!Id_Reproduccion) {
            return res.status(400).json({
                message: "Id_Reproduccion es obligatorio"
            })
        }

        const existe = await CalendarioService.findByReproduccion(Id_Reproduccion)

        if (existe) {
            return res.status(400).json({
                message: "Ya existe calendario para esta reproducción"
            })
        }

        const data = await CalendarioService.create(req.body)
        res.status(201).json(data)

    } catch (error) {
        console.error(error) // 👈 IMPORTANTE
        res.status(500).json({ message: error.message })
    }
}

export const updateCalendario = async (req, res) => {
    try {
        await CalendarioService.update(req.params.id, req.body)
        res.status(200).json({ message: 'Calendario actualizado correctamente' })

    } catch (error) {
        res.status(400).json({ message: error.message })
    }
}


export const getCalendarioByReproduccion = async (req, res) => {
    try {
        const calendario = await CalendarioService.findByReproduccion(req.params.idReproduccion)
        res.status(200).json(calendario) // devuelve null si no existe
    } catch (error) {
        res.status(500).json({ message: error.message })
    }
}

export const deleteCalendario = async (req, res) => {
    try {
        await CalendarioService.delete(req.params.id)
        res.status(204).send()

    } catch (error) {
        res.status(400).json({ message: error.message })
    }
} 