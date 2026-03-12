import reproduccionesModel from "../models/reproduccionesModel.js";
import PorcinoModel from "../models/porcinoModel.js";
import MontaModel from "../models/montaModel.js";
import InseminacionModel from "../models/inseminacionModel.js";

class reproduccionesService {

    async getAll() {
        return await reproduccionesModel.findAll({
            include: [
                { model: PorcinoModel, as: 'porcino', attributes: ['Nom_Porcino'] },
                { model: MontaModel, as: 'montas', attributes: ['Id_Monta'] },
                { model: InseminacionModel, as: 'inseminaciones', attributes: ['Id_Inseminacion'] }
            ]
        })
    }

    async getById(id) {
        const reproduccion = await reproduccionesModel.findByPk(id, {
            include: [
                { model: PorcinoModel, as: 'porcino', attributes: ['Nom_Porcino'] },
                { model: MontaModel, as: 'montas', attributes: ['Id_Monta'] },
                { model: InseminacionModel, as: 'inseminaciones', attributes: ['Id_Inseminacion'] }
            ]
        })
        if (!reproduccion) throw new Error('Reproduccion no encontrada')
        return reproduccion
    }

    // ✅ Sin validación de tipo duplicado — el frontend maneja la lógica
    async create(data) {
        return await reproduccionesModel.create(data)
    }

    async update(id, data) {
        const reproduccion = await reproduccionesModel.findByPk(id)
        if (!reproduccion) throw new Error('Reproduccion no encontrada')
        await reproduccionesModel.update(data, { where: { Id_Reproduccion: id } })
        return true
    }

    async delete(id) {
        const deleted = await reproduccionesModel.destroy({ where: { Id_Reproduccion: id } })
        if (deleted === 0) throw new Error('Reproduccion no encontrada')
        return true
    }
}

export default new reproduccionesService()