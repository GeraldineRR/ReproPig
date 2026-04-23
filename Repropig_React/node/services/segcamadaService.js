import SegcamadaModel from "../models/segcamadaModel.js"
import criaModel from "../models/criaModel.js"

class SegcamadaService {

    async getAll() {
        return await SegcamadaModel.findAll({
            include: [
                {
                    model: criaModel,
                    as: 'crias'
                },
            ]
        })
    }

    async getById(id) {
        const Segcamada = await SegcamadaModel.findByPk(id,{
            
        include: [
                {model : criaModel, 
                as: 'crias'
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