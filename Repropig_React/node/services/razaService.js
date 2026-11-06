import RazaModel from "../models/razaModel.js"

class RazaService {

    async getAll() {
        return await RazaModel.findAll({
            order: [['Id_Raza', 'DESC']]
        });
    }

    async getById(id) {
        const raza = await RazaModel.findByPk(id)
        if (!raza) throw new Error('Raza no encontrada')
        return raza
    }

    async create(data) {
    const existe = await RazaModel.findOne({
        where: { Nom_Raza: data.Nom_Raza }
    })

    if (existe) {
        throw new Error('La raza ya existe')
    }

    return await RazaModel.create(data);
}

    async update(id, data) {
        const raza = await RazaModel.findByPk(id)
        if (!raza) throw new Error('Raza no encontrada')

        if (data.Nom_Raza && data.Nom_Raza.trim() !== raza.Nom_Raza) {
            const existe = await RazaModel.findOne({
                where: { Nom_Raza: data.Nom_Raza.trim() }
            })
            if (existe) throw new Error('Ya existe una raza con este nombre')
        }

        await raza.update(data)
        return raza
    }

    async delete(id) {
        const deleted = await RazaModel.destroy({ where: { Id_Raza: id } })

        if (!deleted) throw new Error('Raza no encontrada')
        return true
    }
}

export default new RazaService()