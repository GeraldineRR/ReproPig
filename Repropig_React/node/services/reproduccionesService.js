import reproduccionesModel from "../models/reproduccionesModel.js";
import PorcinoModel from "../models/porcinoModel.js";
import MontaModel from "../models/montaModel.js";
import InseminacionModel from "../models/inseminacionModel.js";

class reproduccionesService {

    async getAll() {
        return await reproduccionesModel.findAll({
            include: [
                { model: PorcinoModel, as: 'porcino', attributes: ['Nom_Porcino'] },
                { model: MontaModel, as: 'montas', attributes: ['Id_Monta', 'Fec_hora'] },           // 👈 agrega Fecha
                { model: InseminacionModel, as: 'inseminaciones', attributes: ['Id_Inseminacion', 'Fec_hora'] } // 👈 agrega Fecha
            ]
        })
    }

    async getById(id) {
        return await reproduccionesModel.findByPk(id, {
            include: [
                { model: PorcinoModel, as: 'porcino', attributes: ['Nom_Porcino'] },
                { model: MontaModel, as: 'montas', attributes: ['Id_Monta', 'Fec_hora'] },           // 👈 agrega Fecha
                { model: InseminacionModel, as: 'inseminaciones', attributes: ['Id_Inseminacion', 'Fec_hora'] } // 👈 agrega Fecha
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
        const reproduccion = await reproduccionesModel.findByPk(id)
        if (!reproduccion) throw new Error('Reproduccion no encontrada')

        // ✅ Borrar montas e inseminaciones relacionadas primero
        await MontaModel.destroy({ where: { Id_Reproduccion: id } })
        await InseminacionModel.destroy({ where: { Id_Reproduccion: id } })

        // ✅ Luego borrar la reproducción
        await reproduccionesModel.destroy({ where: { Id_Reproduccion: id } })
        return true
    }
}

export default new reproduccionesService()