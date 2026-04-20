import ResponsablesModel from "../models/responsablesModel.js"

class ResponsablesService {

    async getAll() {
        return await ResponsablesModel.findAll()
    }

    async getById(id) {
        const responsable = await ResponsablesModel.findByPk(id)
        if (!responsable) throw new Error('Responsable no encontrado')
        return responsable
    }

    async create(data) {
        return await ResponsablesModel.create(data)
    }

    async update(id, data) {
        // ✅ Verificar existencia antes de actualizar
        const responsable = await ResponsablesModel.findByPk(id)
        if (!responsable) throw new Error('Responsable no encontrado')
        await ResponsablesModel.update(data, { where: { Id_Responsable: id } })
        return true
    }

    async delete(id) {
        const deleted = await ResponsablesModel.destroy({ where: { Id_Responsable: id } })
        if (!deleted) throw new Error('Responsable no encontrado')
        return true
    }
}

export default new ResponsablesService()