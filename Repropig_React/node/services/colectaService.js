import colectaModel from "../models/colectaModel.js";
import PorcinoModel from "../models/porcinoModel.js";

class colectaService {

    async getAll() {
        return await colectaModel.findAll({
            include: [{
                model: PorcinoModel,
                as: 'porcino',
                attributes: ['Nom_Porcino']
            }]
        })
    }

    async getById(id) {
        const colecta = await colectaModel.findByPk(id)
        if (!colecta) throw new Error('Colecta no encontrada');
        return colecta;
    }

    async create(data) {
        return await colectaModel.create(data)
    }

    async update(id, data) {
        const colecta = await colectaModel.findByPk(id)
        if (!colecta) throw new Error('Colecta no encontrada')
        await colectaModel.update(data, { where: { Id_colecta: id } })
        return true
    }

    async delete(id) {
        const colecta = await colectaModel.findByPk(id)
        if (!colecta) throw new Error('Colecta no encontrada')

        // ✅ Verificar que no tenga inseminaciones asociadas
        const { default: inseminacionModel } = await import('../models/inseminacionModel.js')
        const inseminaciones = await inseminacionModel.count({ where: { Id_colecta: id } })
        if (inseminaciones > 0) {
            throw new Error(`No se puede eliminar: tiene ${inseminaciones} inseminación(es) asociada(s)`)
        }

        await colectaModel.destroy({ where: { Id_colecta: id } })
        return true
    }
}

export default new colectaService()