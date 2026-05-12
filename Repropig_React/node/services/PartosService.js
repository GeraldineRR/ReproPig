import PartosModel from "../models/PartosModel.js";
import PorcinoModel from "../models/porcinoModel.js";
import reproduccionesModel from "../models/reproduccionesModel.js";
import RazaModel from "../models/razaModel.js";
import CriaModel from "../models/criaModel.js";

class PartosService {

    async getALL() {
        return await PartosModel.findAll({
            include: [
                {
                    model: PorcinoModel,
                    as: 'porcino',
                    include: [
                        { model: RazaModel, as: 'raza' }
                    ]
                },
                { model: reproduccionesModel, as: 'reproduccion' },
            ],
            order: [['createdAt', 'DESC']]
        })
    }

    async getById(id) {
        const parto = await PartosModel.findByPk(id, {
            include: [
                {
                    model: PorcinoModel,
                    as: 'porcino',
                    include: [
                        { model: RazaModel, as: 'raza' }
                    ]
                },
                { model: reproduccionesModel, as: 'reproduccion' },
            ]
        })
        if (!parto) throw new Error('Parto no encontrado')
        return parto
    }

    async create(data) {
        const parto = await PartosModel.create(data)

        if (data.Id_Reproduccion) {
            await reproduccionesModel.update(
                { Activo: 'N' },
                { where: { Id_Reproduccion: data.Id_Reproduccion } }
            )
        }

        // ── Auto-crear crías basándose en el total de nacidos ──
        const nacVivos = Number(data.Nac_vivos) || 0
        const nacMuertos = Number(data.Nac_muertos) || 0
        const nacMomias = Number(data.Nac_momias) || 0
        const fechaParto = data.Fec_fin || new Date()

        const criasData = []
        let numCria = 1

        // Crías vivas
        for (let i = 0; i < nacVivos; i++) {
            criasData.push({
                Id_parto: parto.Id_parto,
                Num_Cria: numCria++,
                Sexo: '--',
                Estado: 'Vivo',
                Causa_Muerte: null,
                Fecha_Muerte: null
            })
        }

        // Crías nacidas muertas
        for (let i = 0; i < nacMuertos; i++) {
            criasData.push({
                Id_parto: parto.Id_parto,
                Num_Cria: numCria++,
                Sexo: '--',
                Estado: 'Muerto',
                Causa_Muerte: 'Nacido muerto',
                Fecha_Muerte: fechaParto
            })
        }

        // Crías momias
        for (let i = 0; i < nacMomias; i++) {
            criasData.push({
                Id_parto: parto.Id_parto,
                Num_Cria: numCria++,
                Sexo: '--',
                Estado: 'Muerto',
                Causa_Muerte: 'Momia',
                Fecha_Muerte: fechaParto
            })
        }

        if (criasData.length > 0) {
            await CriaModel.bulkCreate(criasData)
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