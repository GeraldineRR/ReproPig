import montaModel from "../models/montaModel.js";
import PorcinoModel from "../models/porcinoModel.js";

class montaService {

    async getAll() {
        return await montaModel.findAll({
            include: [
                {
                    model: PorcinoModel,
                    as: 'porcino',
                }
            ]
        })
    }

    async getById(id) {

        const Monta = await montaModel.findByPk(id, {
    include: [{
        model: PorcinoModel,
        as: 'porcino'
    }]
})
        if (!Monta) throw new Error('Monta no encontrada')
        return Monta
    }


    async create(data) {
        return await montaModel.create(data)
    }

    async update(id, data) {

        const result = await montaModel.update(data, { where: {Id_Monta : id } })
        const updated = result[0]

        if (updated === 0) throw new Error('Monta no encontrada o sin cambios')
            
        return true
    
    }
    async delete(id) {
        const deleted = await montaModel.destroy({ where: { Id_Monta: id } });
        if (deleted === 0) throw new Error('Monta no encontrada')
        return true
    }
}

export default new montaService()