import CriaModel from "../models/criaModel.js"
import PartosModel from "../models/PartosModel.js"
import PorcinoModel from "../models/porcinoModel.js"

class CriaService {

    async getAll() {
        return await CriaModel.findAll({
            include: [
                {
                    model: PartosModel,
                    as: 'partos',
                    include: [
                        {
                            model: PorcinoModel,
                            as: 'porcino'
                        }
                    ]
                }
            ]
        })
    }

    async getById(id) {
        const cria = await CriaModel.findByPk(id, {
            include: [
                {
                    model: PartosModel,
                    as: 'partos',
                    include: [
                        {
                            model: PorcinoModel,
                            as: 'porcino'
                        }
                    ]
                }
            ]
        })
        if (!cria) throw new Error('Cria no encontrado')
        return cria
    }

    async create(data) {
        const total = await CriaModel.count({ where: { Id_parto: data.Id_parto } })
        const nuevoNumero = total + 1

        const existe = await CriaModel.findOne({
            where: {
                Id_parto: data.Id_parto,
                Num_Cria: nuevoNumero
            }
        })

        if (existe) {
            throw new Error('Conflicto: número de cría duplicado, intenta nuevamente')
        }

        data.Num_Cria = nuevoNumero

        return await CriaModel.create(data)
    }

    async update(id, data) {
        const result = await CriaModel.update(data, { where: { Id_Cria: id } })
        const update = result[0]

        if (update === 0) throw new Error('Cria no encontrado o sin cambios')
        return true
    }

    async delete(id) {
        const deleted = await CriaModel.destroy({ where: { Id_Cria: id } })
        if (!deleted) throw new Error('Cria no encontrado')
        return true
    }

    async getCriasByParto(idParto) {
        return await CriaModel.findAll({
            where: { Id_parto: idParto }
        })
    }
}

export default new CriaService()