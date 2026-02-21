import reproduccionesModel from "../models/reproduccionesModel.js";

class reproduccionesService {

    async getAll() {
        return await reproduccionesModel.findAll()
    }

    async getById(id) {

        const reproducciones = await reproduccionesModel.findByPk(id)
        if (!reproducciones) throw new Error('Reproduccion no encontrada');
        return reproducciones;
    }


    async create(data) {
        return await reproduccionesModel.create(data)
    }

    async update(id, data) {

        const result = await reproduccionesModel.update(data, { where: {Id_reproduccion : id } })
        const updated = result[0]

        if (updated === 0) throw new Error('Reproduccion no encontrada o sin cambios')
            
        return true
    
    }
    async delete(id) {
        const deleted = await reproduccionesModel.destroy({ where: { Id_reproduccion: id } });
        if (deleted === 0) throw new Error('Reproduccion no encontrada')
        return true
    }
}

export default new reproduccionesService()