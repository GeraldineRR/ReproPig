import RazaModel from "../models/razaModel.js"

class RazaService {

    async getAll() {
        return await RazaModel.findAll()
    }

    async getById(id) {
        const raza = await RazaModel.findByPk(id)
        if (!raza) throw new Error('Raza no encontrada')
        return raza
    }

    async create(data) {
        return await RazaModel.create(data)
    }

    async update(id, data) {
        const result = await RazaModel.update(data, { where: { Id_Raza: id } })
        const update = result[0]

        if (update === 0) throw new Error('Raza no encontrada o sin cambios')
        return true
    }

    async delete(id) {
        const deleted = await RazaModel.destroy({ where: { Id_Raza: id } })

        if (!deleted) throw new Error('Raza no encontrada')
        return true
    }
}

export default new RazaService()