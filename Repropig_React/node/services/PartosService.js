import PartosModel from "../models/PartosModel.js";
import PorcinoModel from "../models/porcinoModel.js";

class PartosService {

    async getALL() {
        return await PartosModel.findAll({
            include: [
                {
                    model: PorcinoModel,
                    as: 'porcinos'
                },
            ],
            order: [['createdAt', 'DESC']]
        })
    }

    async getById(id) {
        const parto = await PartosModel.findByPk(id, {
            include: [
                {
                    model: PorcinoModel,
                    as: 'porcinos'
                }
            ]
        })
        if (!parto) throw new Error('Parto no encontrado')
        return parto
    }

    async getById(id) {

        const Partos = await PartosModel.findByPk(id)
        if (!Partos) throw new Error("Partos no encontrada")
        return Partos
    }

    async create(data) {
        return await PartosModel.create(data)
    }

    async update(id, data) {
        const result = await PartosModel.update(data, { where: { id_parto: id } })
        const update = result[0]

        if (update === 0) throw new Error("Partos no encontrada o sin cambios")

        return true
    }
    async delete(id) {
        const deleted = await PartosModel.destroy({ where: { id_parto: id } })

        if (!deleted) throw new Error("Partos no encontrada")
        return true
    }
}

export default new PartosService()