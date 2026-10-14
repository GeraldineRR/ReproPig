import PorcinoModel from "../models/porcinoModel.js"
import RazaModel from "../models/razaModel.js"
import { Op } from "sequelize"

class PorcinoService {

    async getAll() {
        return await PorcinoModel.findAll({
            include: [
                {
                    model: RazaModel,
                    as: 'raza'
                },
            ],
            order: [['Id_Porcino', 'DESC']]
        })
    }

    async getLechonesByParto(idParto) {
        return await PorcinoModel.findAll({
            where: {
                Tipo_Cerdo: 'Lechon',
                Id_parto: idParto,
                Estado: { [Op.ne]: 'Muerto' }
            },
            include: [{ model: RazaModel, as: 'raza' }],
            order: [['Id_Porcino', 'ASC']]
        })
    }

    async getById(id) {
        const porcino = await PorcinoModel.findByPk(id,{
            include: [
                {model : RazaModel, 
                as: 'raza'
            }
            ]
        })
        if (!porcino) throw new Error('Porcino no encontrado')
        return porcino
    }

    async create(data) {
        if (data.Num_Chapeta !== undefined && data.Num_Chapeta !== null && data.Num_Chapeta !== '') {
            const existeChapeta = await PorcinoModel.findOne({
                where: { Num_Chapeta: data.Num_Chapeta }
            })
            if (existeChapeta) {
                throw new Error(`La chapeta #${data.Num_Chapeta} ya se encuentra registrada en el porcino "${existeChapeta.Nom_Porcino || 'ID ' + existeChapeta.Id_Porcino}".`)
            }
        }

        if (data.Plac_Sena_Porcino !== undefined && data.Plac_Sena_Porcino !== null && data.Plac_Sena_Porcino !== '') {
            const existePlaca = await PorcinoModel.findOne({
                where: { Plac_Sena_Porcino: data.Plac_Sena_Porcino }
            })
            if (existePlaca) {
                throw new Error(`La placa SENA #${data.Plac_Sena_Porcino} ya se encuentra registrada en el porcino "${existePlaca.Nom_Porcino || 'ID ' + existePlaca.Id_Porcino}".`)
            }
        }

        return await PorcinoModel.create(data)
    }

    async update(id, data) {
        if (data.Num_Chapeta !== undefined && data.Num_Chapeta !== null && data.Num_Chapeta !== '') {
            const existeChapeta = await PorcinoModel.findOne({
                where: {
                    Num_Chapeta: data.Num_Chapeta,
                    Id_Porcino: { [Op.ne]: id }
                }
            })
            if (existeChapeta) {
                throw new Error(`La chapeta #${data.Num_Chapeta} ya se encuentra registrada en el porcino "${existeChapeta.Nom_Porcino || 'ID ' + existeChapeta.Id_Porcino}".`)
            }
        }

        if (data.Plac_Sena_Porcino !== undefined && data.Plac_Sena_Porcino !== null && data.Plac_Sena_Porcino !== '') {
            const existePlaca = await PorcinoModel.findOne({
                where: {
                    Plac_Sena_Porcino: data.Plac_Sena_Porcino,
                    Id_Porcino: { [Op.ne]: id }
                }
            })
            if (existePlaca) {
                throw new Error(`La placa SENA #${data.Plac_Sena_Porcino} ya se encuentra registrada en el porcino "${existePlaca.Nom_Porcino || 'ID ' + existePlaca.Id_Porcino}".`)
            }
        }

        const result = await PorcinoModel.update(data, { where: { Id_Porcino: id } })
        const update = result[0]

        if (update === 0) throw new Error('Porcino no encontrado o sin cambios')
        return true
    }

    async delete(id) {
        const deleted = await PorcinoModel.destroy({ where: { Id_Porcino: id } })

        if (!deleted) throw new Error('Porcino no encontrado')
        return true
    }
}

export default new PorcinoService()