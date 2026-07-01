import PartosModel from "../models/PartosModel.js";
import PorcinoModel from "../models/porcinoModel.js";
import reproduccionesModel from "../models/reproduccionesModel.js";
import RazaModel from "../models/razaModel.js";
import CriaModel from "../models/criaModel.js";
import SegcamadaModel from "../models/segcamadaModel.js";

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

    // ── Verificar si un parto tiene seguimiento de camada iniciado ──
    async tieneSeguimiento(idParto) {
        const crias = await CriaModel.findAll({
            where: { Id_parto: idParto },
            attributes: ['Id_Cria']
        })

        if (crias.length === 0) return false

        const criaIds = crias.map(c => c.Id_Cria)

        const countSeg = await SegcamadaModel.count({
            where: { Id_Cria: criaIds }
        })

        return countSeg > 0
    }

    async update(id, data) {
        const parto = await PartosModel.findByPk(id)
        if (!parto) throw new Error("Parto no encontrado")

        // Verificar si cambiaron los campos de crías
        const nacVivosNuevo = Number(data.Nac_vivos) || 0
        const nacMuertosNuevo = Number(data.Nac_muertos) || 0
        const nacMomiasNuevo = Number(data.Nac_momias) || 0

        const cambiaronCrias = (
            nacVivosNuevo !== parto.Nac_vivos ||
            nacMuertosNuevo !== parto.Nac_muertos ||
            nacMomiasNuevo !== parto.Nac_momias
        )

        if (cambiaronCrias) {
            // Si hay seguimiento iniciado, bloquear cambios en crías
            const haySeguimiento = await this.tieneSeguimiento(id)
            if (haySeguimiento) {
                throw new Error("No se pueden modificar las crías: ya existe seguimiento de camada iniciado para este parto")
            }

            // Actualizar el parto primero
            await PartosModel.update(data, { where: { Id_parto: id } })

            // Obtener las crías existentes
            const existingCrias = await CriaModel.findAll({
                where: { Id_parto: id },
                order: [['Id_Cria', 'ASC']]
            });

            // Clasificar en grupos
            const existingVivos = existingCrias.filter(c => c.Estado === 'Vivo');
            const existingMuertos = existingCrias.filter(c => c.Estado === 'Muerto' && c.Causa_Muerte !== 'Momia');
            const existingMomias = existingCrias.filter(c => c.Estado === 'Muerto' && c.Causa_Muerte === 'Momia');

            const idsToDelete = [];
            const keptCrias = [];
            const newCriasData = [];

            // Ajustar Vivos
            if (nacVivosNuevo >= existingVivos.length) {
                keptCrias.push(...existingVivos);
                const diff = nacVivosNuevo - existingVivos.length;
                for (let i = 0; i < diff; i++) {
                    newCriasData.push({
                        Id_parto: Number(id),
                        Sexo: '--',
                        Estado: 'Vivo',
                        Causa_Muerte: null,
                        Fecha_Muerte: null
                    });
                }
            } else {
                keptCrias.push(...existingVivos.slice(0, nacVivosNuevo));
                const toDelete = existingVivos.slice(nacVivosNuevo);
                idsToDelete.push(...toDelete.map(c => c.Id_Cria));
            }

            // Ajustar Muertos
            const fechaParto = data.Fec_fin || parto.Fec_fin || new Date();
            if (nacMuertosNuevo >= existingMuertos.length) {
                keptCrias.push(...existingMuertos);
                const diff = nacMuertosNuevo - existingMuertos.length;
                for (let i = 0; i < diff; i++) {
                    newCriasData.push({
                        Id_parto: Number(id),
                        Sexo: '--',
                        Estado: 'Muerto',
                        Causa_Muerte: 'Nacido muerto',
                        Fecha_Muerte: fechaParto
                    });
                }
            } else {
                keptCrias.push(...existingMuertos.slice(0, nacMuertosNuevo));
                const toDelete = existingMuertos.slice(nacMuertosNuevo);
                idsToDelete.push(...toDelete.map(c => c.Id_Cria));
            }

            // Ajustar Momias
            if (nacMomiasNuevo >= existingMomias.length) {
                keptCrias.push(...existingMomias);
                const diff = nacMomiasNuevo - existingMomias.length;
                for (let i = 0; i < diff; i++) {
                    newCriasData.push({
                        Id_parto: Number(id),
                        Sexo: '--',
                        Estado: 'Muerto',
                        Causa_Muerte: 'Momia',
                        Fecha_Muerte: fechaParto
                    });
                }
            } else {
                keptCrias.push(...existingMomias.slice(0, nacMomiasNuevo));
                const toDelete = existingMomias.slice(nacMomiasNuevo);
                idsToDelete.push(...toDelete.map(c => c.Id_Cria));
            }

            // Ejecutar eliminaciones
            if (idsToDelete.length > 0) {
                await CriaModel.destroy({
                    where: { Id_Cria: idsToDelete }
                });
            }

            // Actualizar número de cría en las que se mantienen
            keptCrias.sort((a, b) => a.Id_Cria - b.Id_Cria);
            let numCria = 1;
            for (const cria of keptCrias) {
                await CriaModel.update(
                    { Num_Cria: numCria++ },
                    { where: { Id_Cria: cria.Id_Cria } }
                );
            }

            // Insertar nuevas crías con su número correspondiente
            if (newCriasData.length > 0) {
                const finalNewCrias = newCriasData.map(cria => ({
                    ...cria,
                    Num_Cria: numCria++
                }));
                await CriaModel.bulkCreate(finalNewCrias);
            }
        } else {
            // Solo actualizar campos del parto (sin tocar crías)
            const result = await PartosModel.update(data, { where: { Id_parto: id } })
            if (result[0] === 0) throw new Error("Parto no encontrado o sin cambios")
        }

        return true
    }

    async delete(id) {
        const deleted = await PartosModel.destroy({ where: { Id_parto: id } })

        if (!deleted) throw new Error("Parto no encontrado")
        return true
    }
}

export default new PartosService()