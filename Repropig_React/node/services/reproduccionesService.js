import reproduccionesModel from "../models/reproduccionesModel.js";
import PorcinoModel from "../models/porcinoModel.js";

class reproduccionesService {

    async getAll() {
        return await reproduccionesModel.findAll({
            include: [{
                model: PorcinoModel,
                as: 'porcino',
                attributes: ['Nom_Porcino']
            }]
        })
    }

    async getById(id) {
        const reproduccion = await reproduccionesModel.findByPk(id, {
            include: [{
                model: PorcinoModel,
                as: 'porcino',
                attributes: ['Nom_Porcino']
            }]
        })

        if (!reproduccion)
            throw new Error('Reproduccion no encontrada');

        return reproduccion;
    }

    async create(data) {
        return await reproduccionesModel.create(data)
    }

    async update(id, data) {
        const result = await reproduccionesModel.update(data, {
            where: { Id_Reproduccion: id }  // ✅ IMPORTANTE
        })

        if (result[0] === 0)
            throw new Error('Reproduccion no encontrada o sin cambios')

        return true
    }

    async delete(id) {
        const deleted = await reproduccionesModel.destroy({
            where: { Id_Reproduccion: id }  // ✅ IMPORTANTE
        })

        if (deleted === 0)
            throw new Error('Reproduccion no encontrada')

        return true
    }
}

export default new reproduccionesService()