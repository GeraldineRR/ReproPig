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
        const Calendario = await CalendarioService.create(req.body)
        res.status(201).json({ message: 'Calendario creado', Calendario })

    } catch (error) {
        res.status(400).json({ message: error.message })
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


export const deleteCalendario = async (req, res) => {
    try {
        await CalendarioService.delete(req.params.id)
        res.status(204).send()

    } catch (error) {
        res.status(400).json({ message: error.message })
    }
} 