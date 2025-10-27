import MortalidadModel from "../models/MortalidadModel.js";

class MortalidadService {

    async getALL() {
        return await MortalidadModel.findAll()
    }
    async getById(id) {

        const mortalidad = await MortalidadModel.findByPk(id)
        if (!mortalidad) throw new Error("Mortalidad no encontrada")
        return mortalidad
    }

    async create(data) {
        return await MortalidadModel.create(data)
    }

    async update(id, data) {
        const result = await MortalidadModel.update(data, {where: { id_Mortalidad: id } })
        const update = result[0]

        if (update === 0) throw new Error("Mortalidad no encontrada o sin cambios")

        return true
    }
    async delete (id){
        const deleted = await MortalidadModel.destroy({ where: { id_Mortalidad: id} })

        if (!deleted) throw new Error ("Mortalidad no encontrada")
        return true
    }
}

export default new MortalidadService()