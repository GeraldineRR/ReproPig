import CalendarioModel from "../models/CalendarioModel.js";
import ciclosModel from "../models/ciclosModel.js";
import PorcinoModel from "../models/porcinoModel.js";

function calcularEventos(fechaServicio) {
    const clean = String(fechaServicio || '').split('T')[0].split(' ')[0];
    const [y, m, d] = clean.split('-').map(Number);
    const base = (y && m && d) ? new Date(y, m - 1, d, 12, 0, 0) : new Date();

    const sumar = (dias) => {
        const dObj = new Date(base);
        dObj.setDate(dObj.getDate() + dias);
        return dObj;
    };

    return {
        rc1: sumar(21),
        rc2: sumar(42),
        cambio_alimento: sumar(100),
        dia_107: sumar(107),
        parto: sumar(114)
    };
}

class CalendarioService {
    async getAll() {
        return await CalendarioModel.findAll({
            include: [
                {
                    model: ciclosModel,
                    as: 'ciclo',
                    include: [
                        {
                            model: PorcinoModel,
                            as: 'porcino',
                            attributes: ['Id_Porcino', 'Nom_Porcino']
                        }
                    ]
                },
            ]
        })
    }

    async getById(id) {
        const Calendario = await CalendarioModel.findByPk(id, {
            include: [
                {
                    model: ciclosModel,
                    as: 'ciclo',
                    include: [
                        {
                            model: PorcinoModel,
                            as: 'porcino',
                            attributes: ['Id_Porcino', 'Nom_Porcino']
                        }
                    ]
                }
            ]
        })
        if (!Calendario) throw new Error('Calendario no encontrado')
        return Calendario
    }

    async create(data) {
        const { Id_Ciclo, Fecha_Servicio } = data;

        const eventos = calcularEventos(Fecha_Servicio);

        return await CalendarioModel.create({
            Id_Ciclo,
            Fecha_Servicio,

            rc1: eventos.rc1,
            rc2: eventos.rc2,
            cambio_alimento: eventos.cambio_alimento,
            dia_107: eventos.dia_107,
            parto: eventos.parto,
        });
    }

    async update(id, data) {
        if (data.Fecha_Servicio) {
            const eventos = calcularEventos(data.Fecha_Servicio);
            data.rc1 = eventos.rc1;
            data.rc2 = eventos.rc2;
            data.cambio_alimento = eventos.cambio_alimento;
            data.dia_107 = eventos.dia_107;
            data.parto = eventos.parto;
        }

        const calItem = await CalendarioModel.findByPk(id)
        if (!calItem) throw new Error('Calendario no encontrado')
        await CalendarioModel.update(data, { where: { Id_Calendario: id } })
        return true
    }

    /**
     * Registrar revisión de un evento específico del calendario.
     * @param {number} id - Id del calendario
     * @param {string} evento - Nombre del evento: 'rc1', 'rc2', 'cambio_alimento', 'dia_107', 'parto'
     * @param {object} revisionData - { fecha_revision, resultado, observaciones }
     */
    async registerRevision(id, evento, revisionData) {
        const calendario = await CalendarioModel.findByPk(id)
        if (!calendario) throw new Error('Calendario no encontrado')

        // Validar que no haya eventos posteriores registrados
        if (evento === 'rc1' && (calendario.real_rc2 || calendario.real_cambio_alimento || calendario.real_dia_107 || calendario.real_parto)) {
            throw new Error('No se puede modificar este evento porque ya existe un registro posterior')
        }
        if (evento === 'rc2' && (calendario.real_cambio_alimento || calendario.real_dia_107 || calendario.real_parto)) {
            throw new Error('No se puede modificar este evento porque ya existe un registro posterior')
        }
        if (evento === 'cambio_alimento' && (calendario.real_dia_107 || calendario.real_parto)) {
            throw new Error('No se puede modificar este evento porque ya existe un registro posterior')
        }
        if (evento === 'dia_107' && calendario.real_parto) {
            throw new Error('No se puede modificar este evento porque ya existe un registro posterior')
        }

        // Sincronizar orden secuencial: autocompletar pasos previos no registrados si se avanza a una etapa posterior (ej. ciclos históricos)
        if (evento === 'rc2' && !calendario.real_rc1) {
            calendario.real_rc1 = calendario.rc1;
            calendario.resultado_rc1 = 'no_recelo';
            await CalendarioModel.update({ real_rc1: calendario.rc1, resultado_rc1: 'no_recelo' }, { where: { Id_Calendario: id } });
        }
        if (evento === 'cambio_alimento') {
            const autoUpdates = {};
            if (!calendario.real_rc1) { autoUpdates.real_rc1 = calendario.rc1; autoUpdates.resultado_rc1 = 'no_recelo'; }
            if (!calendario.real_rc2) { autoUpdates.real_rc2 = calendario.rc2; autoUpdates.resultado_rc2 = 'no_recelo'; }
            if (Object.keys(autoUpdates).length > 0) {
                await CalendarioModel.update(autoUpdates, { where: { Id_Calendario: id } });
            }
        }
        if (evento === 'dia_107') {
            const autoUpdates = {};
            if (!calendario.real_rc1) { autoUpdates.real_rc1 = calendario.rc1; autoUpdates.resultado_rc1 = 'no_recelo'; }
            if (!calendario.real_rc2) { autoUpdates.real_rc2 = calendario.rc2; autoUpdates.resultado_rc2 = 'no_recelo'; }
            if (!calendario.real_cambio_alimento) { autoUpdates.real_cambio_alimento = calendario.cambio_alimento; autoUpdates.resultado_cambio = 'realizado'; }
            if (Object.keys(autoUpdates).length > 0) {
                await CalendarioModel.update(autoUpdates, { where: { Id_Calendario: id } });
            }
        }
        if (evento === 'parto') {
            const autoUpdates = {};
            if (!calendario.real_rc1) { autoUpdates.real_rc1 = calendario.rc1; autoUpdates.resultado_rc1 = 'no_recelo'; }
            if (!calendario.real_rc2) { autoUpdates.real_rc2 = calendario.rc2; autoUpdates.resultado_rc2 = 'no_recelo'; }
            if (!calendario.real_cambio_alimento) { autoUpdates.real_cambio_alimento = calendario.cambio_alimento; autoUpdates.resultado_cambio = 'realizado'; }
            if (!calendario.real_dia_107) { autoUpdates.real_dia_107 = calendario.dia_107; autoUpdates.resultado_107 = 'realizado'; }
            if (Object.keys(autoUpdates).length > 0) {
                await CalendarioModel.update(autoUpdates, { where: { Id_Calendario: id } });
            }
        }

        const { fecha_revision, resultado, observaciones } = revisionData

        const updateData = {}

        switch (evento) {
            case 'rc1':
                updateData.real_rc1 = fecha_revision || null
                updateData.resultado_rc1 = resultado || null
                updateData.observaciones_rc1 = observaciones || null
                break
            case 'rc2':
                updateData.real_rc2 = fecha_revision || null
                updateData.resultado_rc2 = resultado || null
                updateData.observaciones_rc2 = observaciones || null
                break
            case 'cambio_alimento':
                updateData.real_cambio_alimento = fecha_revision || null
                updateData.resultado_cambio = resultado || 'realizado'
                updateData.observaciones_cambio = observaciones || null
                break
            case 'dia_107':
                updateData.real_dia_107 = fecha_revision || null
                updateData.resultado_107 = resultado || 'realizado'
                updateData.observaciones_107 = observaciones || null
                break
            case 'parto':
                updateData.real_parto = fecha_revision || null
                updateData.observaciones_parto = observaciones || null
                break
            default:
                throw new Error('Evento no válido: ' + evento)
        }

        await CalendarioModel.update(updateData, { where: { Id_Calendario: id } })

        // ✅ Actualizar estado del ciclo según el resultado del recelo o parto
        const updatedCal = await CalendarioModel.findByPk(id)
        if (updatedCal && updatedCal.Id_Ciclo) {
            const hayRecelo = updatedCal.resultado_rc1 === 'recelo_detectado' || updatedCal.resultado_rc2 === 'recelo_detectado'
            const hayParto = !!updatedCal.real_parto

            if (hayRecelo) {
                // Si presenta recelo en RC1 o RC2, pasa a Fallido
                await ciclosModel.update(
                    { Estado: 'Fallido' },
                    { where: { Id_Ciclo: updatedCal.Id_Ciclo } }
                )
            } else if (hayParto) {
                // Si se registró el parto, pasa a Finalizado
                await ciclosModel.update(
                    { Estado: 'Finalizado' },
                    { where: { Id_Ciclo: updatedCal.Id_Ciclo } }
                )
            } else {
                // Si no hay recelo ni parto y el calendario sigue en marcha, pasa a Activo
                await ciclosModel.update(
                    { Estado: 'Activo' },
                    { where: { Id_Ciclo: updatedCal.Id_Ciclo } }
                )
            }
        }

        return await CalendarioModel.findByPk(id)
    }

    async findByCiclo(Id_Ciclo) {
        return await CalendarioModel.findOne({
            where: { Id_Ciclo },
            include: [
                {
                    model: ciclosModel,
                    as: 'ciclo',
                    include: [
                        {
                            model: PorcinoModel,
                            as: 'porcino',
                            attributes: ['Id_Porcino', 'Nom_Porcino']
                        }
                    ]
                }
            ]
        })
    }

    async delete(id) {
        const deleted = await CalendarioModel.destroy({ where: { Id_Calendario: id } })

        if (!deleted) throw new Error('Calendario no encontrado')
        return true
    }
}

export default new CalendarioService()