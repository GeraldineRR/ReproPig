import SegcamadaModel from "../models/segcamadaModel.js"
import criaModel from "../models/criaModel.js"
import MedicamentosModel from "../models/MedicamentosModel.js"
import PartosModel from "../models/PartosModel.js"
import db from "../database/db.js"
import { Op } from "sequelize"

class SegcamadaService {

    async getAll() {
        return await SegcamadaModel.findAll({
            include: [
                {
                    model: criaModel,
                    as: 'crias',
                    include:
                    {
                        model: PartosModel,
                        as: 'partos'
                    }

                },
                {
                    model: MedicamentosModel,
                    as: 'medicamentos'
                }
            ]
        })
    }

    async getById(id) {
        const Segcamada = await SegcamadaModel.findByPk(id, {

            include: [
                {
                    model: criaModel,
                    as: 'crias'
                },
                {
                    model: MedicamentosModel,
                    as: 'medicamentos'
                }

            ]
        })
        if (!Segcamada) throw new Error('Camada no encontrada')
        return Segcamada
    }

    async create(data) {
        return await SegcamadaModel.create(data)
    }

    async update(id, data) {
        const currentRecord = await SegcamadaModel.findByPk(id);
        if (!currentRecord) throw new Error('Camada no encontrada');

        // Verificar si existe un seguimiento posterior para la misma cría
        const newerRecord = await SegcamadaModel.findOne({
            where: {
                Id_Cria: currentRecord.Id_Cria,
                Dia_Programado: {
                    [Op.gt]: currentRecord.Dia_Programado
                }
            }
        });

        if (newerRecord) {
            throw new Error('No se puede editar: Existe un seguimiento posterior para esta cría');
        }

        const result = await SegcamadaModel.update(data, { where: { Id_SegCamada: id } })
        const update = result[0]

        if (update === 0) throw new Error('Camada no encontrada o sin cambios')
        return true
    }

    async delete(id) {
        const deleted = await SegcamadaModel.destroy({ where: { Id_SegCamada: id } })
        if (!deleted) throw new Error('Camada no encontrada')
        return true
    }
}

export default new SegcamadaService()