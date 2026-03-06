import MedicamentosModel from "../models/MedicamentosModel.js"

class MedicamentosService {

    async getALL() {
        return await MedicamentosModel.findAll()
    }
    async getById(id) {

        const medicamento = await MedicamentosModel.findByPk(id)
        if (!medicamento) throw new Error("Medicamento no encontrado")
        return medicamento
    }

    async create(data) {
        return await MedicamentosModel.create(data)
    }

    async update(id, data) {
        const result = await MedicamentosModel.update(data, {where: { id_Medicamento: id } })
        const update = result[0]

        if (update === 0) throw new Error("Medicamento no encontrado o sin cambios")

        return true
    }
    async delete (id){
        const deleted = await MedicamentosModel.destroy({ where: { id_Medicamento: id} })

        if (!deleted) throw new Error ("Medicamento no encontrado")
        return true
    }
}

export default new MedicamentosService()