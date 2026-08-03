import PartosModel from "../models/PartosModel.js";
import PorcinoModel from "../models/porcinoModel.js";
import ciclosModel from "../models/ciclosModel.js";
import RazaModel from "../models/razaModel.js";
import NovedadesModel from "../models/novedadesModel.js";
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
                { model: ciclosModel, as: 'ciclo' },
            ],
            order: [['Id_parto', 'DESC']]
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
                { model: ciclosModel, as: 'ciclo' },
            ]
        })
        if (!parto) throw new Error('Parto no encontrado')
        return parto
    }

    async create(data) {
        const parto = await PartosModel.create(data)

        if (data.Id_Ciclo) {
            await ciclosModel.update(
                { Estado: 'Inactivo' },
                { where: { Id_Ciclo: data.Id_Ciclo } }
            )
        }

        // ── Auto-crear lechones (porcinos) basándose en el total de nacidos ──
        const nacVivos = Number(data.Nac_vivos) || 0;
        const nacMuertos = Number(data.Nac_muertos) || 0;
        const nacMomias = Number(data.Nac_momias) || 0;
        const fechaParto = data.Fec_fin || new Date();

        // Obtener la raza de la madre para asignarla a los lechones
        const madre = await PorcinoModel.findByPk(data.Id_Porcino);
        const razaId = madre ? madre.Id_Raza : 1; // Fallback a 1 si no se encuentra

        const porcinosData = [];
        const novedadesData = [];
        
        let numLechon = 1;

        // Crías vivas
        for (let i = 0; i < nacVivos; i++) {
            porcinosData.push({
                Id_Raza: razaId,
                Gen_Porcino: '-', // Sexo por definir
                Tipo_Cerdo: 'Lechon',
                Proc_Porcino: 'Interno',
                Fec_Nac_Porcino: fechaParto,
                Estado: 'Activo',
                Id_parto: parto.Id_parto
            });
        }

        // Crías nacidas muertas
        for (let i = 0; i < nacMuertos; i++) {
            porcinosData.push({
                Id_Raza: razaId,
                Gen_Porcino: '-',
                Tipo_Cerdo: 'Lechon',
                Proc_Porcino: 'Interno',
                Fec_Nac_Porcino: fechaParto,
                Estado: 'Inactivo', // Nacido muerto
                Id_parto: parto.Id_parto
            });
        }

        // Crías momias
        for (let i = 0; i < nacMomias; i++) {
            porcinosData.push({
                Id_Raza: razaId,
                Gen_Porcino: '-',
                Tipo_Cerdo: 'Lechon',
                Proc_Porcino: 'Interno',
                Fec_Nac_Porcino: fechaParto,
                Estado: 'Inactivo', // Momia
                Id_parto: parto.Id_parto
            });
        }

        if (porcinosData.length > 0) {
            const creados = await PorcinoModel.bulkCreate(porcinosData);
            
            // Crear novedades para los muertos y momias
            let indexCreado = nacVivos; // Saltamos los vivos
            
            // Novedades para muertos
            for (let i = 0; i < nacMuertos; i++) {
                if (creados[indexCreado]) {
                    novedadesData.push({
                        Id_Porcino: creados[indexCreado].Id_Porcino,
                        Tipo_Novedad: 'Muerte',
                        Fecha_Novedad: fechaParto,
                        Causa_Motivo: 'Nacido muerto'
                    });
                }
                indexCreado++;
            }
            
            // Novedades para momias
            for (let i = 0; i < nacMomias; i++) {
                if (creados[indexCreado]) {
                    novedadesData.push({
                        Id_Porcino: creados[indexCreado].Id_Porcino,
                        Tipo_Novedad: 'Muerte',
                        Fecha_Novedad: fechaParto,
                        Causa_Motivo: 'Momia'
                    });
                }
                indexCreado++;
            }
            
            if (novedadesData.length > 0) {
                await NovedadesModel.bulkCreate(novedadesData);
            }
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