import Seguimiento_CerdaModel from "../models/Seguimiento_CerdaModel.js";
import PorcinoModel from "../models/porcinoModel.js";
import responsablesModel from "../models/responsablesModel.js";

class Seguimiento_CerdaService {
    async getAll() {
        return await Seguimiento_CerdaModel.findAll({ 
            include: [
                { 
                model: PorcinoModel,
                as: 'porcinos'},
            ]
        })
    }
    async getAll() {
        return await Seguimiento_CerdaModel.findAll({ 
            include: [
                { 
                model: responsablesModel,
                as: 'responsables'},
            ]
        })
    }


    async getAll() {
        return await Seguimiento_CerdaModel.findAll()
    }

    async getById(id) {
        const Seguimiento_Cerda = await Seguimiento_CerdaModel.findByPk(id)
        if (!Seguimiento_Cerda) throw new Error('Seguimiento_Cerda no encontrado')
        return Seguimiento_Cerda
    }

    async create(data) {
        return await Seguimiento_CerdaModel.create(data)
    }

    async update(id, data) {
        const result = await Seguimiento_CerdaModel.update(data, { where: { Id_Seguimiento_Cerda: id } })
        const update = result[0]

        if (update === 0) throw new Error('Seguimiento_Cerda no encontrado o sin cambios')
        return true
    }

    async delete(id) {
        const deleted = await Seguimiento_CerdaModel.destroy({ where: { Id_Seguimiento_Cerda: id } })

        if (!deleted) throw new Error('Seguimiento_Cerda no encontrado')
        return true
    }
}

export default new Seguimiento_CerdaService()