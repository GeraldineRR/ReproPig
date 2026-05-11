import SegcamadaModel from "../models/segcamadaModel.js"
import criaModel from "../models/criaModel.js"
import MedicamentosModel from "../models/MedicamentosModel.js"
import PartosModel from "../models/PartosModel.js"

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