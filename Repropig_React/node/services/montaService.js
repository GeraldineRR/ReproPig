import montaModel from "../models/montaModel.js";
import PorcinoModel from "../models/porcinoModel.js";
import ciclosModel from "../models/ciclosModel.js";

class montaService {

    async getAll() {
        return await montaModel.findAll({
            include: [{
                model: PorcinoModel,
                as: 'porcino',
                attributes: ['Id_Porcino', 'Nom_Porcino', 'Num_Chapeta']
            }, {
                model: PorcinoModel,
                as: 'cerdo',
                attributes: ['Id_Porcino', 'Nom_Porcino', 'Num_Chapeta']
            }, {
                model: ciclosModel,
                as: 'ciclo',
                attributes: ['Id_Ciclo', 'Estado', 'TipoCiclo']
            }],
            order: [['Fec_hora', 'DESC']]
        })
    }

    async getById(id) {
        const monta = await montaModel.findByPk(id, {
            include: [{ model: PorcinoModel, as: 'porcino' }]
        })
        if (!monta) throw new Error('Monta no encontrada')
        return monta
    }

    async create(data) {
        return await montaModel.create(data)
    }

    async update(id, data) {
        const monta = await montaModel.findByPk(id)
        if (!monta) throw new Error('Monta no encontrada')
        await montaModel.update(data, { where: { Id_Monta: id } })
        return true
    }

    async delete(id) {
        const deleted = await montaModel.destroy({ where: { Id_Monta: id } })
        if (deleted === 0) throw new Error('Monta no encontrada')
        return true
    }
}

export default new montaService()