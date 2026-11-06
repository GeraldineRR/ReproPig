import RazaModel from "../models/razaModel.js"
import { Op } from "sequelize"

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
        const nombreTrim = data.Nom_Raza ? data.Nom_Raza.trim() : '';
        if (!nombreTrim) throw new Error('El nombre de la raza es obligatorio');

        const existe = await RazaModel.findOne({
            where: { Nom_Raza: nombreTrim }
        })

        if (existe) {
            throw new Error('La raza ya existe')
        }

        return await RazaModel.create({ ...data, Nom_Raza: nombreTrim });
    }

    async update(id, data) {
        const raza = await RazaModel.findByPk(id)
        if (!raza) throw new Error('Raza no encontrada')

        if (data.Nom_Raza) {
            const nombreTrim = data.Nom_Raza.trim()
            const existe = await RazaModel.findOne({
                where: {
                    Nom_Raza: nombreTrim,
                    Id_Raza: { [Op.ne]: id }
                }
            })
            if (existe) throw new Error('Ya existe otra raza con este nombre')
            data.Nom_Raza = nombreTrim
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