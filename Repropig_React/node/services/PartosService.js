import PartosModel from "../models/PartosModel.js";
import PorcinoModel from "../models/porcinoModel.js";
import reproduccionesModel from "../models/reproduccionesModel.js";

class PartosService {

    async getALL() {
        return await PartosModel.findAll({
            include: [
                { model: PorcinoModel, as: 'porcinos' },
                { model: reproduccionesModel, as: 'reproduccion' },
            ]
        })
    }

    async getById(id) {
        const parto = await PartosModel.findByPk(id, {
            include: [
                { model: PorcinoModel, as: 'porcinos' },
                { model: reproduccionesModel, as: 'reproduccion' },
            ]
        })
        if (!parto) throw new Error('Parto no encontrado')
        return parto
    }

    async create(data) {
        const parto = await PartosModel.create(data)

        // Si viene Id_Reproduccion, inactivar esa reproducción automáticamente
        if (data.Id_Reproduccion) {
            await reproduccionesModel.update(
                { Activo: 'N' },
                { where: { Id_Reproduccion: data.Id_Reproduccion } }
            )
        }

        return parto
    }

    async update(id, data) {
        const result = await PartosModel.update(data, { where: { Id_parto: id } })
        const update = result[0]

        if (update === 0) throw new Error("Parto no encontrado o sin cambios")

        return true
    }

    async delete(id) {
        const deleted = await PartosModel.destroy({ where: { Id_parto: id } })

        if (!deleted) throw new Error("Parto no encontrado")
        return true
    }
}

export default new PartosService()