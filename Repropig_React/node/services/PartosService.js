import PartosModel from "../models/PartosModel.js";
import PorcinoModel from "../models/porcinoModel.js";
import ciclosModel from "../models/ciclosModel.js";
import RazaModel from "../models/razaModel.js";
import NovedadesModel from "../models/novedadesModel.js";
import CalendarioModel from "../models/CalendarioModel.js";
import MontaModel from "../models/montaModel.js";
import InseminacionModel from "../models/inseminacionModel.js";
import CalendarioService from "./CalendarioService.js";
import db from "../database/db.js";

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

    async getByCiclo(idCiclo) {
        return await PartosModel.findOne({
            where: { Id_Ciclo: idCiclo },
            include: [
                {
                    model: PorcinoModel,
                    as: 'porcino',
                    include: [{ model: RazaModel, as: 'raza' }]
                },
                {
                    model: PorcinoModel,
                    as: 'lechones',
                    attributes: ['Id_Porcino', 'Nom_Porcino', 'Num_Chapeta', 'Gen_Porcino', 'Pes_Nacer', 'Estado']
                },
                { model: ciclosModel, as: 'ciclo' }
            ],
            order: [['Id_parto', 'DESC']]
        })
    }

    async create(data) {
if (data.Id_Ciclo) {
            const ciclo = await ciclosModel.findByPk(data.Id_Ciclo, {
                include: [
                    { model: CalendarioModel, as: 'calendario' },
                    { model: PartosModel, as: 'partos' }
                ]
            });

            if (!ciclo) {
                throw new Error("El ciclo especificado no existe");
            }
            if (ciclo.Estado !== 'Activo') {
                throw new Error("El ciclo reproductivo debe estar activo para registrar un parto");
            }

            const cal = ciclo.calendario;
            if (!cal) {
                throw new Error("El ciclo no tiene un calendario reproductivo asociado");
            }
            if (cal.resultado_rc1 === 'recelo_detectado' || cal.resultado_rc2 === 'recelo_detectado') {
                throw new Error("El ciclo presentó recelo detectado. No se puede registrar un parto en este ciclo");
            }
            if (!cal.real_rc1 || !cal.real_rc2 || !cal.real_cambio_alimento || !cal.real_dia_107) {
                throw new Error("El ciclo tiene eventos pendientes en el calendario reproductivo (debe completar RC1, RC2, Cambio de alimento y Día 107 para habilitar el parto)");
            }
            if (cal.real_parto || (ciclo.partos && ciclo.partos.length > 0)) {
                throw new Error("Este ciclo ya tiene un parto registrado");
            }
        }

        return await db.transaction(async (t) => {
            const parto = await PartosModel.create(data, { transaction: t });

            if (data.Id_Ciclo) {
                await ciclosModel.update(
                    { Estado: 'Finalizado' },
                    { where: { Id_Ciclo: data.Id_Ciclo }, transaction: t }
                )

                const fechaParto = data.Fec_fin || data.Fec_inicio || new Date();
                await CalendarioModel.update(
                    { real_parto: fechaParto },
                    { where: { Id_Ciclo: data.Id_Ciclo }, transaction: t }
                )

                // Sincronizar fecha de revisión en el Calendario
                const fechaRevisionParto = data.Fec_fin || data.Fec_inicio;
                if (fechaRevisionParto) {
                    try {
                        let cal = await CalendarioModel.findOne({
                            where: { Id_Ciclo: data.Id_Ciclo },
                            transaction: t
                        });
                        if (cal) {
                            await CalendarioModel.update(
                                {
                                    real_parto: fechaRevisionParto,
                                    observaciones_parto: data.Observaciones || cal.observaciones_parto
                                },
                                { where: { Id_Calendario: cal.Id_Calendario }, transaction: t }
                            );
                        } else {
                            // Si no existe calendario pero el ciclo tiene montas o inseminaciones, crearlo
                            const ciclo = await ciclosModel.findByPk(data.Id_Ciclo, {
                                include: [
                                    { model: MontaModel, as: 'montas' },
                                    { model: InseminacionModel, as: 'inseminaciones' }
                                ],
                                transaction: t
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
                                    { where: { Id_Calendario: calNuevo.Id_Calendario }, transaction: t }
                                );
                            }
                        }
                    } catch (calError) {
                        console.error("Error sincronizando parto con Calendario:", calError);
                    }
                }
            }

            // Los nacidos muertos y momias NO se registran en la base de datos como porcinos ni novedades,
            // únicamente se conservan como conteo numérico en el parto (Nac_muertos, Nac_momias).
            return parto;
        });
    }

    async update(id, data) {
        const partoAnterior = await PartosModel.findByPk(id)
        if (!partoAnterior) throw new Error("Parto no encontrado")
        await PartosModel.update(data, { where: { Id_parto: id } })

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
        return await db.transaction(async (t) => {
            const parto = await PartosModel.findByPk(id, { transaction: t })
            // Validar si existen lechones vinculados a este parto
            const lechonesCount = await PorcinoModel.count({ where: { Id_parto: id }, transaction: t })
            if (lechonesCount > 0) {
                throw new Error(`No se puede eliminar el parto porque tiene ${lechonesCount} lechón(es) registrado(s). Debe gestionar las crías antes de eliminar el parto.`)
            }

            const deleted = await PartosModel.destroy({ where: { Id_parto: id }, transaction: t })

            if (!deleted) throw new Error("Parto no encontrado")

            if (parto && parto.Id_Ciclo) {
                // Revertir el estado del ciclo a Activo
                await ciclosModel.update(
                    { Estado: 'Activo' },
                    { where: { Id_Ciclo: parto.Id_Ciclo }, transaction: t }
                )
                try {
                    await CalendarioModel.update(
                        { real_parto: null, observaciones_parto: null },
                        { where: { Id_Ciclo: parto.Id_Ciclo }, transaction: t }
                    )
                } catch (err) {
                    console.error("Error limpiando real_parto en Calendario:", err)
                }
            }

            return true
        })
    }
}

export default new PartosService()