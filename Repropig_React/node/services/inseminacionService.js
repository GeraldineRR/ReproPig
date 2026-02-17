import inseminacionModel from "../models/inseminacionModel.js";

class inseminacionService {

    async getAll() {
        return await inseminacionModel.findAll({
            
        })
    }

    async getById(id) {

        const inseminacion = await inseminacionModel.findByPk(id)
        if (!inseminacion) throw new Error('Reproduccion no encontrada');
        return inseminacion;
    }


    async create(data) {
        return await inseminacionModel.create(data)
    }

    async update(id, data) {

        const result = await inseminacionModel.update(data, { where: {Id_reproduccion : id } })
        const updated = result[0]

        if (updated === 0) throw new Error('Reproduccion no encontrada o sin cambios')
            
        return true
    
    }
    async delete(id) {
        const deleted = await inseminacionModel.destroy({ where: { Id_reproduccion: id } });
        if (deleted === 0) throw new Error('Reproduccion no encontrada')
        return true
    }
}

export default new inseminacionService()