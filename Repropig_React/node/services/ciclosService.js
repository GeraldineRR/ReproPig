import ciclosModel from "../models/ciclosModel.js";
import PorcinoModel from "../models/porcinoModel.js";
import MontaModel from "../models/montaModel.js";
import InseminacionModel from "../models/inseminacionModel.js";
import colectaModel from "../models/colectaModel.js";
import CalendarioModel from "../models/CalendarioModel.js";
import PartosModel from "../models/PartosModel.js";
import NovedadesModel from "../models/novedadesModel.js";
import db from "../database/db.js";

class ciclosService {

    async getAll() {
        try {
            // Sincronizar automáticamente cerdas con bajas para que sus ciclos activos queden en Inactivo
            const novedadesBaja = await NovedadesModel.findAll({
                where: {
                    Tipo_Novedad: ['Muerte', 'Descarte', 'Traslado']
                },
                attributes: ['Id_Porcino', 'Tipo_Novedad']
            });

            const idsBaja = novedadesBaja && novedadesBaja.length > 0
                ? [...new Set(novedadesBaja.map(n => n.Id_Porcino))]
                : [];

            if (idsBaja.length > 0) {
                await ciclosModel.update(
                    { Estado: 'Inactivo' },
                    {
                        where: {
                            Id_Cerda: idsBaja,
                            Estado: 'Activo'
                        }
                    }
                );
                for (const nov of novedadesBaja) {
                    const nuevoEstadoPorcino = nov.Tipo_Novedad === 'Muerte' ? 'Muerto' : nov.Tipo_Novedad === 'Traslado' ? 'Trasladado' : 'Inactivo';
                    await PorcinoModel.update(
                        { Estado: nuevoEstadoPorcino },
                        { where: { Id_Porcino: nov.Id_Porcino, Estado: 'Activo' } }
                    );
                }
            }

            // Revisar porcinos que estén marcados como Muerto, Trasladado o Inactivo
            const porcinosNoActivos = await PorcinoModel.findAll({
                where: {
                    Estado: ['Muerto', 'Trasladado', 'Inactivo']
                },
                attributes: ['Id_Porcino', 'Estado']
            });

            // Si hay algún porcino marcado como Inactivo/Muerto/Trasladado que ya NO tiene novedad de baja
            // (por ejemplo, porque se editó la novedad de Descarte a Lesión o se eliminó),
            // restaurarlo a Activo y restablecer su ciclo reproductivo activo más reciente si no está finalizado.
            const porcinosSinBaja = porcinosNoActivos.filter(p => !idsBaja.includes(p.Id_Porcino));
            for (const p of porcinosSinBaja) {
                await PorcinoModel.update({ Estado: 'Activo' }, { where: { Id_Porcino: p.Id_Porcino } });

                const cicloActivoExistente = await ciclosModel.findOne({
                    where: { Id_Cerda: p.Id_Porcino, Estado: 'Activo' }
                });

                if (!cicloActivoExistente) {
                    const ultimoCiclo = await ciclosModel.findOne({
                        where: { Id_Cerda: p.Id_Porcino },
                        order: [['Id_Ciclo', 'DESC']]
                    });

                    if (ultimoCiclo) {
                        const hayParto = (await PartosModel.count({ where: { Id_Ciclo: ultimoCiclo.Id_Ciclo } })) > 0;
                        const cal = await CalendarioModel.findOne({ where: { Id_Ciclo: ultimoCiclo.Id_Ciclo } });
                        const tienePartoReal = Boolean(cal && cal.real_parto);
                        const tieneRecelo = Boolean(cal && (cal.resultado_rc1 === 'recelo_detectado' || cal.resultado_rc2 === 'recelo_detectado'));

                        if (!hayParto && !tienePartoReal && !tieneRecelo) {
                            await ultimoCiclo.update({ Estado: 'Activo' });
                        }
                    }
                }
            }
        } catch (syncErr) {
            console.error('Error sincronizando estados de ciclos y novedades:', syncErr);
        }

        return await ciclosModel.findAll({
            order: [['Id_Ciclo', 'DESC']],
            include: [
                {
                    model: PorcinoModel,
                    as: 'porcino',
                    attributes: ['Id_Porcino', 'Nom_Porcino', 'Num_Chapeta', 'Estado'],
                    include: [
                        {
                            model: NovedadesModel,
                            as: 'novedades',
                            attributes: ['Id_Novedad', 'Tipo_Novedad', 'Fecha_Novedad', 'Causa_Motivo']
                        }
                    ]
                },
                {
                    model: MontaModel,
                    as: 'montas',
                    separate: true,
                    include: [{ model: PorcinoModel, as: 'cerdo', attributes: ['Id_Porcino', 'Nom_Porcino'] }]
                },
                {
                    model: InseminacionModel,
                    as: 'inseminaciones',
                    separate: true,
                    include: [{
                        model: colectaModel,
                        as: 'colecta',
                        include: [{ model: PorcinoModel, as: 'porcino', attributes: ['Id_Porcino', 'Nom_Porcino'] }]
                    }]
                },
                {
                    model: CalendarioModel,
                    as: 'calendario'
                },
                {
                    model: PartosModel,
                    as: 'partos',
                    separate: true
                }
            ]
        })
    }

    async getById(id) {
        const ciclo = await ciclosModel.findByPk(id, {
            include: [
                {
                    model: PorcinoModel,
                    as: 'porcino',
                    attributes: ['Id_Porcino', 'Nom_Porcino', 'Num_Chapeta', 'Estado'],
                    include: [
                        {
                            model: NovedadesModel,
                            as: 'novedades',
                            attributes: ['Id_Novedad', 'Tipo_Novedad', 'Fecha_Novedad', 'Causa_Motivo']
                        }
                    ]
                },
                {
                    model: MontaModel,
                    as: 'montas',
                    separate: true,
                    include: [{ model: PorcinoModel, as: 'cerdo', attributes: ['Id_Porcino', 'Nom_Porcino'] }]
                },
                {
                    model: InseminacionModel,
                    as: 'inseminaciones',
                    separate: true,
                    include: [{
                        model: colectaModel,
                        as: 'colecta',
                        include: [{ model: PorcinoModel, as: 'porcino', attributes: ['Id_Porcino', 'Nom_Porcino'] }]
                    }]
                },
                {
                    model: CalendarioModel,
                    as: 'calendario'
                },
                {
                    model: PartosModel,
                    as: 'partos',
                    separate: true
                }
            ]
        })
        if (!ciclo) throw new Error('Ciclo no encontrada')
        return ciclo
    }

    async create(data) {
        try {
            console.log("📥 Datos recibidos:", data);

            // Validar que la cerda no esté de baja ni tenga novedad de muerte/descarte/traslado
            const cerda = await PorcinoModel.findByPk(data.Id_Cerda);
            if (cerda && ['Muerto', 'Inactivo', 'Trasladado'].includes(cerda.Estado)) {
                throw new Error(`No se puede iniciar ciclo. La cerda está registrada como ${cerda.Estado}.`);
            }
            const novedadBaja = await NovedadesModel.findOne({
                where: {
                    Id_Porcino: data.Id_Cerda,
                    Tipo_Novedad: ['Muerte', 'Descarte', 'Traslado']
                }
            });
            if (novedadBaja) {
                throw new Error(`No se puede iniciar ciclo. La cerda tiene novedad registrada de ${novedadBaja.Tipo_Novedad}.`);
            }

            const existeActiva = await ciclosModel.findOne({
                where: { Id_Cerda: data.Id_Cerda, Estado: 'Activo' }
            });

            if (existeActiva) {
                throw new Error('Esta cerda ya tiene un ciclo activo. Debes inactivarla antes de registrar una nueva.');
            }

            const nueva = await ciclosModel.create({
                Id_Cerda: data.Id_Cerda,
                TipoCiclo: data.TipoCiclo,
                Estado: 'Activo'
            });
            console.log("✅ Guardado con ID:", nueva.Id_Ciclo);
            return nueva;
        } catch (error) {
            console.error("❌ Error al guardar:", error.message);
            throw error;
        }
    }

    async update(id, data) {
        const ciclo = await ciclosModel.findByPk(id)
        if (!ciclo) throw new Error('Ciclo no encontrada')
        ciclo.Id_Cerda = data.Id_Cerda || ciclo.Id_Cerda
        ciclo.Estado = data.Estado || ciclo.Estado
        ciclo.TipoCiclo = data.TipoCiclo || ciclo.TipoCiclo
        await ciclo.save()
        return true
    }

    async toggleEstado(id) {
        const ciclo = await ciclosModel.findByPk(id)
        if (!ciclo) throw new Error('Ciclo no encontrada')

        const estadoActual = ciclo.Estado || 'Inactivo'
        const nuevoEstado = estadoActual === 'Activo' ? 'Inactivo' : 'Activo'

        if (nuevoEstado === 'Activo') {
            const cerda = await PorcinoModel.findByPk(ciclo.Id_Cerda);
            if (cerda && ['Muerto', 'Inactivo', 'Trasladado'].includes(cerda.Estado)) {
                throw new Error(`No se puede activar el ciclo porque la cerda está registrada como ${cerda.Estado}.`);
            }
            const novedadBaja = await NovedadesModel.findOne({
                where: {
                    Id_Porcino: ciclo.Id_Cerda,
                    Tipo_Novedad: ['Muerte', 'Descarte', 'Traslado']
                }
            });
            if (novedadBaja) {
                throw new Error(`No se puede activar el ciclo porque la cerda tiene novedad registrada de ${novedadBaja.Tipo_Novedad}.`);
            }

            const existeActiva = await ciclosModel.findOne({
                where: { Id_Cerda: ciclo.Id_Cerda, Estado: 'Activo' }
            });
            if (existeActiva) {
                throw new Error('Esta cerda ya tiene un ciclo activo. Debes inactivarla antes de reactivar esta.');
            }
        }

        ciclo.Estado = nuevoEstado
        await ciclo.save()
        return nuevoEstado
    }

    async delete(id) {
        return await db.transaction(async (t) => {
            const ciclo = await ciclosModel.findByPk(id, { transaction: t })
            if (!ciclo) throw new Error('Ciclo no encontrado')

            // Validar si tiene partos asociados antes de permitir borrar
            const partosAsociados = await PartosModel.count({ where: { Id_Ciclo: id }, transaction: t })
            if (partosAsociados > 0) {
                throw new Error('No se puede eliminar el ciclo porque tiene un parto registrado. Elimine el parto primero.')
            }

            // Limpiar eventos en calendario vinculados a este ciclo
            await CalendarioModel.destroy({ where: { Id_Ciclo: id }, transaction: t })

            // Limpiar montas e inseminaciones vinculadas
            await MontaModel.destroy({ where: { Id_Ciclo: id }, transaction: t })
            await InseminacionModel.destroy({ where: { Id_Ciclo: id }, transaction: t })

            // Eliminar ciclo
            await ciclosModel.destroy({ where: { Id_Ciclo: id }, transaction: t })
            return true
        })
    }
}

export default new ciclosService()
