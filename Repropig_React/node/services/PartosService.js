import PartosModel from "../models/PartosModel.js";
import PorcinoModel from "../models/porcinoModel.js";
import ciclosModel from "../models/ciclosModel.js";
import RazaModel from "../models/razaModel.js";
import NovedadesModel from "../models/novedadesModel.js";
import CalendarioModel from "../models/CalendarioModel.js";
import MontaModel from "../models/montaModel.js";
import InseminacionModel from "../models/inseminacionModel.js";
import CalendarioService from "./CalendarioService.js";
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
                { Estado: 'Finalizado' },
                { where: { Id_Ciclo: data.Id_Ciclo } }
            )

            const fechaParto = data.Fec_fin || data.Fec_inicio || new Date();
            await CalendarioModel.update(
                { real_parto: fechaParto },
                { where: { Id_Ciclo: data.Id_Ciclo } }
            )

            // Sincronizar fecha de revisión en el Calendario
            const fechaRevisionParto = data.Fec_fin || data.Fec_inicio;
            if (fechaRevisionParto) {
                try {
                    let cal = await CalendarioModel.findOne({ where: { Id_Ciclo: data.Id_Ciclo } });
                    if (cal) {
                        await CalendarioModel.update(
                            {
                                real_parto: fechaRevisionParto,
                                observaciones_parto: data.Observaciones || cal.observaciones_parto
                            },
                            { where: { Id_Calendario: cal.Id_Calendario } }
                        );
                    } else {
                        // Si no existe calendario pero el ciclo tiene montas o inseminaciones, crearlo
                        const ciclo = await ciclosModel.findByPk(data.Id_Ciclo, {
                            include: [
                                { model: MontaModel, as: 'montas' },
                                { model: InseminacionModel, as: 'inseminaciones' }
                            ]
                        });
                        let fServicio = null;
                        if (ciclo?.montas?.length > 0) {
                            fServicio = ciclo.montas[0].Fec_Monta;
                        } else if (ciclo?.inseminaciones?.length > 0) {
                            fServicio = ciclo.inseminaciones[0].Fec_Inseminacion;
                        }
                        if (fServicio) {
                            const calNuevo = await CalendarioService.create({
                                Id_Ciclo: data.Id_Ciclo,
                                Fecha_Servicio: fServicio
                            });
                            await CalendarioModel.update(
                                {
                                    real_parto: fechaRevisionParto,
                                    observaciones_parto: data.Observaciones || null
                                },
                                { where: { Id_Calendario: calNuevo.Id_Calendario } }
                            );
                        }
                    }
                } catch (calError) {
                    console.error("Error sincronizando parto con Calendario:", calError);
                }
            }
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
        const partoAnterior = await PartosModel.findByPk(id)
        const result = await PartosModel.update(data, { where: { Id_parto: id } })
        const update = result[0]

        if (update === 0) throw new Error("Parto no encontrado o sin cambios")

        // Sincronizar fecha de revisión en el Calendario
        const idCiclo = data.Id_Ciclo || partoAnterior?.Id_Ciclo
        const fechaRevisionParto = data.Fec_fin || data.Fec_inicio || partoAnterior?.Fec_fin || partoAnterior?.Fec_inicio

        if (idCiclo && fechaRevisionParto) {
            try {
                const cal = await CalendarioModel.findOne({ where: { Id_Ciclo: idCiclo } })
                if (cal) {
                    await CalendarioModel.update(
                        {
                            real_parto: fechaRevisionParto,
                            observaciones_parto: data.Observaciones !== undefined ? data.Observaciones : cal.observaciones_parto
                        },
                        { where: { Id_Calendario: cal.Id_Calendario } }
                    )
                }
            } catch (calErr) {
                console.error("Error actualizando fecha_parto en Calendario:", calErr)
            }
        }

        return true
    }

    async delete(id) {
        const parto = await PartosModel.findByPk(id)
        const deleted = await PartosModel.destroy({ where: { Id_parto: id } })

        if (!deleted) throw new Error("Parto no encontrado")

        if (parto && parto.Id_Ciclo) {
            try {
                await CalendarioModel.update(
                    { real_parto: null, observaciones_parto: null },
                    { where: { Id_Ciclo: parto.Id_Ciclo } }
                )
            } catch (err) {
                console.error("Error limpiando real_parto en Calendario:", err)
            }
        }

        return true
    }
}

export default new PartosService()