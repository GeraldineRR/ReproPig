import NacimientoModel from "../models/NacimientoModel.js";

class NacimientoService {
    async getAll() {
        return await NacimientoModel.findAll()
    }
    async getById(id) {
        const Nacimiento = await NacimientoModel.findByPk(id) 
        if (!Nacimiento) throw new Error ("Nacimiento no encontrado")
        return Nacimiento
    }

    async create(data) {
        return await NacimientoModel.create(data)
    }
    async update(id,data) {
        const result = await NacimientoModel.update(data, {where: { id_Nacimiento: id} })
        const update = result[0]

        if (update === 0) throw new Error("Nacimiento no encontrado o sin cambios")
            return true
    }
    async delete(id) {
        const deleted = await NacimientoModel.destroy({ where: {id_Nacimiento: id}})
        if (!deleted) throw new Error("Nacimiento no encontrado")
            return true
    
    }
}

export default new NacimientoService()