import reproduccionesModel from "../models/reproduccionesModel.js";
import PorcinoModel from "../models/porcinoModel.js";

class reproduccionesService {

    async getAll() {
        return await reproduccionesModel.findAll({
            include: [{
                model: PorcinoModel,
                as: 'porcino',
                attributes: ['Nom_Porcino']
            }]
        })
    }

    async getById(id) {
        const reproduccion = await reproduccionesModel.findByPk(id, {
            include: [{
                model: PorcinoModel,
                as: 'porcino',
                attributes: ['Nom_Porcino']
            }]
        })
        if (!reproduccion)
            throw new Error('Reproduccion no encontrada');
        return reproduccion;
    }

    async create(data) {
        // ✅ Solo bloquea si ya tiene una reproducción activa del MISMO tipo
        if (data.Activo === 'Si' && data.TipoReproduccion) {
            const existente = await reproduccionesModel.findOne({
                where: {
                    Id_Cerda: data.Id_Cerda,
                    Activo: 'Si',
                    TipoReproduccion: data.TipoReproduccion
                }
            })
            if (existente)
                throw new Error(`Esta cerda ya tiene una reproducción activa de tipo ${data.TipoReproduccion}`)
        }

        return await reproduccionesModel.create(data)
    }

    async update(id, data) {
        const reproduccion = await reproduccionesModel.findByPk(id)
        if (!reproduccion)
            throw new Error('Reproduccion no encontrada')

        // ✅ Al actualizar, validar que no haya otra del mismo tipo (excluyendo la actual)
        if (data.Activo === 'Si' && data.TipoReproduccion) {
            const { Op } = await import('sequelize')
            const existente = await reproduccionesModel.findOne({
                where: {
                    Id_Cerda: data.Id_Cerda,
                    Activo: 'Si',
                    TipoReproduccion: data.TipoReproduccion,
                    Id_Reproduccion: { [Op.ne]: id } // excluir la actual
                }
            })
            if (existente)
                throw new Error(`Esta cerda ya tiene una reproducción activa de tipo ${data.TipoReproduccion}`)
        }

        await reproduccionesModel.update(data, { where: { Id_Reproduccion: id } })
        return true
    }

    async delete(id) {
        const deleted = await reproduccionesModel.destroy({
            where: { Id_Reproduccion: id }
        })
        if (deleted === 0)
            throw new Error('Reproduccion no encontrada')
        return true
    }
}

export default new reproduccionesService()