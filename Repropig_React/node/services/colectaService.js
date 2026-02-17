import colectaModel from "../models/colectaModel.js";

class colectaService {

    async getAll() {
        return await colectaModel.findAll()
        //     {
        //         include: [{
        //             model: PorcinoModel,
        //             as: 'Id_porcino',
        
        //         }]
            
        // })
    }

    async getById(id) {

        const colecta = await colectaModel.findByPk(id)
        if (!colecta) throw new Error('colecta no encontrada');
        return colecta;
    }


    async create(data) {
        return await colectaModel.create(data)
    }

    async update(id, data) {

        const result = await colectaModel.update(data, { where: {Id_colecta : id } })
        const updated = result[0]

        if (updated === 0) throw new Error('colecta no encontrada o sin cambios')
            
        return true
    
    }
    async delete(id) {
        const deleted = await colectaModel.destroy({ where: { Id_colecta: id } });
        if (deleted === 0) throw new Error('colecta no encontrada')
        return true
    }
}

export default new colectaService()