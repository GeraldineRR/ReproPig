import CalendarioModel from "../models/CalendarioModel.js";
import reproduccionesModel from "../models/reproduccionesModel.js";

function calcularEventos(fechaServicio) {
    const base = new Date(fechaServicio + 'T00:00:00');

    const sumar = (dias) => {
        const d = new Date(base);
        d.setDate(d.getDate() + dias);
        return d;
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
                    model: reproduccionesModel,
                    as: 'reproduccion'
                },
            ]
        })
    }

    async getById(id) {
        const Calendario = await CalendarioModel.findByPk(id, {
            include: [
                {
                    model: reproduccionesModel,
                    as: 'reproduccion'
                }
            ]
        })
        if (!Calendario) throw new Error('Calendario no encontrado')
        return Calendario

    }

    async create(data) {
        const { Id_Reproduccion, Fecha_Servicio } = data;

        const eventos = calcularEventos(Fecha_Servicio);

        return await CalendarioModel.create({
            Id_Reproduccion,
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

        const result = await CalendarioModel.update(data, { where: { Id_Calendario: id } })
        const updated = result[0]

        if (updated === 0) throw new Error('Calendario no encontrado o sin cambios')
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
                updateData.observaciones_cambio = observaciones || null
                break
            case 'dia_107':
                updateData.real_dia_107 = fecha_revision || null
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
        return await CalendarioModel.findByPk(id)
    }

    async findByReproduccion(Id_Reproduccion) {
        return await CalendarioModel.findOne({
            where: { Id_Reproduccion }
        })
    }

    async delete(id) {
        const deleted = await CalendarioModel.destroy({ where: { Id_Calendario: id } })

        if (!deleted) throw new Error('Calendario no encontrado')
        return true
    }
}

export default new CalendarioService()