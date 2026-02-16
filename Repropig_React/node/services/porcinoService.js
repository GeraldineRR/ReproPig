import PorcinoModel from "../models/porcinoModel.js"
import RazaModel from "../models/razaModel.js"

class PorcinoService {

    async getAll() {
        return await PorcinoModel.findAll({ 
            include: [
                { 
                model: RazaModel,
                as: 'razas'},
            ]
        })
    }

    async getById(id) {
        const porcino = await PorcinoModel.findByPk(id, {
            include: [
                {
                    model: RazaModel,
                    as: 'razas'
                }
            ]
    })
        if (!porcino) throw new Error('Porcino no encontrado')
        return porcino
    }

    async create(data) {
        return await PorcinoModel.create(data)
    }

    async update(id, data) {
        const result = await PorcinoModel.update(data, { where: { Id_Porcino: id } })
        const update = result[0]

        if (update === 0) throw new Error('Porcino no encontrado o sin cambios')
        return true
    }

    async delete(id) {
        const deleted = await PorcinoModel.destroy({ where: { Id_Porcino: id } })

        if (!deleted) throw new Error('Porcino no encontrado')
        return true
    }
}

export default new PorcinoService()