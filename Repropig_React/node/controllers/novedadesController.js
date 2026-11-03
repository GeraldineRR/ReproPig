import NovedadesModel from "../models/novedadesModel.js";
import PorcinoModel from "../models/porcinoModel.js";
import { Op } from "sequelize";

export const getAllNovedades = async (req, res) => {
    try {
        const novedades = await NovedadesModel.findAll({
            where: {
                Causa_Motivo: { [Op.notIn]: ['Nacido muerto', 'Momia'] }
            },
            include: [
                {
                    model: PorcinoModel,
                    as: 'porcino',
                    attributes: ['Id_Porcino', 'Nom_Porcino', 'Num_Chapeta', 'Tipo_Cerdo', 'Estado']
                }
            ],
            order: [['Id_Novedad', 'DESC']]
        });
        res.json(novedades);
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

export const getNovedad = async (req, res) => {
    try {
        const novedad = await NovedadesModel.findByPk(req.params.id);
        if (!novedad) return res.status(404).json({ message: "No encontrada" });
        res.json(novedad);
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

export const createNovedad = async (req, res) => {
    try {
        const { Id_Porcino, Tipo_Novedad } = req.body;

        if (['Muerte', 'Descarte'].includes(Tipo_Novedad)) {
            // Verificar si el porcino ya tiene una novedad previa de Muerte o Descarte
            const existente = await NovedadesModel.findOne({
                where: {
                    Id_Porcino,
                    Tipo_Novedad: ['Muerte', 'Descarte']
                }
            });
            if (existente) {
                return res.status(400).json({
                    message: `El porcino #${Id_Porcino} ya cuenta con un registro previo de ${existente.Tipo_Novedad}. No se permiten duplicados de muerte o descarte.`
                });
            }

            // Verificar si el porcino ya está inactivo o muerto
            const porcino = await PorcinoModel.findByPk(Id_Porcino);
            if (porcino && (porcino.Estado === 'Muerto' || porcino.Estado === 'Inactivo')) {
                return res.status(400).json({
                    message: `El porcino #${Id_Porcino} ya se encuentra registrado como ${porcino.Estado}. No se puede registrar muerte o descarte nuevamente.`
                });
            }
        }

        const novedad = await NovedadesModel.create(req.body);

        // Actualizar el estado del porcino en la base de datos
        if (['Muerte', 'Descarte'].includes(Tipo_Novedad)) {
            const nuevoEstado = Tipo_Novedad === 'Muerte' ? 'Muerto' : 'Inactivo';
            await PorcinoModel.update({ Estado: nuevoEstado }, { where: { Id_Porcino } });
        }

        res.status(201).json({ message: "Creada exitosamente", novedad });
    } catch (error) {
        res.status(400).json({ message: error.message });
    }
};

export const updateNovedad = async (req, res) => {
    try {
        const { Id_Porcino, Tipo_Novedad } = req.body;
        const { id } = req.params;

        if (['Muerte', 'Descarte'].includes(Tipo_Novedad)) {
            const existente = await NovedadesModel.findOne({
                where: {
                    Id_Porcino,
                    Tipo_Novedad: ['Muerte', 'Descarte'],
                    Id_Novedad: { [Op.ne]: id }
                }
            });
            if (existente) {
                return res.status(400).json({
                    message: `El porcino #${Id_Porcino} ya cuenta con otro registro de ${existente.Tipo_Novedad}. No se permiten duplicados.`
                });
            }
        }

        await NovedadesModel.update(req.body, { where: { Id_Novedad: id } });

        if (['Muerte', 'Descarte'].includes(Tipo_Novedad)) {
            const nuevoEstado = Tipo_Novedad === 'Muerte' ? 'Muerto' : 'Inactivo';
            await PorcinoModel.update({ Estado: nuevoEstado }, { where: { Id_Porcino } });
        }

        res.json({ message: "Actualizada" });
    } catch (error) {
        res.status(400).json({ message: error.message });
    }
};

export const deleteNovedad = async (req, res) => {
    try {
        await NovedadesModel.destroy({ where: { Id_Novedad: req.params.id } });
        res.json({ message: "Eliminada" });
    } catch (error) {
        res.status(400).json({ message: error.message });
    }
};
