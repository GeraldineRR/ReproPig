import SegcamadaService from "../services/segcamadaService.js";
import SegCamadaModel from "../models/segcamadaModel.js";
import PartosModel from "../models/PartosModel.js";
import PorcinoModel from "../models/porcinoModel.js";
import CalendarioModel from "../models/CalendarioModel.js";
import ciclosModel from "../models/ciclosModel.js";
import Seguimiento_CerdaModel from "../models/Seguimiento_CerdaModel.js";

export const getAllSegcamadas = async (req, res) => {
    try {
        const segcamadas = await SegcamadaService.getAll()
        res.status(200).json(segcamadas)

    } catch (error) {
        res.status(500).json({ message: error.message })
    }
}

export const getSegCamadaByPorcino = async (req, res) => {
    const { idPorcino } = req.params;

    try {
        const registros = await SegCamadaModel.findAll({
            where: { Id_Porcino: idPorcino },
            order: [['Dia_Programado', 'ASC']]
        });

        res.status(200).json(registros);

    } catch (error) {
        console.error("Error obteniendo registros por porcino:", error);
        res.status(500).json({ error: error.message });
    }
};

export const getSegcamada = async (req, res) => {
    try {
        const segcamada = await SegcamadaService.getById(req.params.id)
        res.status(200).json(segcamada)

    } catch (error) {
        res.status(404).json({ message: error.message })
    }
}


export const createSegcamada = async (req, res) => {
    try {
        const segcamada = await SegcamadaService.create(req.body)
        res.status(201).json({ message: 'Camada creada', segcamada })

    } catch (error) {
        res.status(400).json({ message: error.message })
    }
}


export const updateSegcamada = async (req, res) => {
    try {
        await SegcamadaService.update(req.params.id, req.body)
        res.status(200).json({ message: 'Camada actualizado correctamente' })

    } catch (error) {
        res.status(400).json({ message: error.message })
    }
}


export const deleteSegcamada = async (req, res) => {
    try {
        await SegcamadaService.delete(req.params.id)
        res.status(204).send()

    } catch (error) {
        res.status(400).json({ message: error.message })
    }
}

export const getNotificacionesSeguimiento = async (req, res) => {
    try {
        const diasSeguimiento = [1, 3, 5, 7, 10, 14, 21, 28];

        // Formatear fecha YYYY-MM-DD usando hora local segura
        const formatDateLocal = (dateVal) => {
            if (!dateVal) return null;
            if (typeof dateVal === 'string') {
                const str = dateVal.split('T')[0].trim();
                if (/^\d{4}-\d{2}-\d{2}$/.test(str)) {
                    return str;
                }
            }
            const d = new Date(dateVal);
            if (isNaN(d.getTime())) return null;
            const year = d.getFullYear();
            const month = String(d.getMonth() + 1).padStart(2, '0');
            const day = String(d.getDate()).padStart(2, '0');
            return `${year}-${month}-${day}`;
        };

        const hoy = new Date();
        const hoyStr = formatDateLocal(hoy);

        const manana = new Date(hoy);
        manana.setDate(manana.getDate() + 1);
        const mananaStr = formatDateLocal(manana);

        const enDosDias = new Date(hoy);
        enDosDias.setDate(enDosDias.getDate() + 2);
        const enDosDiasStr = formatDateLocal(enDosDias);

        const notificaciones = [];

        // =========================================================================
        // 1. SEGUIMIENTO DE CAMADA (Lechones en partos activos)
        // =========================================================================
        try {
            const partos = await PartosModel.findAll({
                where: {
                    estado: 'Activo'
                },
                order: [['Id_parto', 'DESC']]
            });

            for (const parto of partos) {
                if (!parto.Fec_fin) continue;

                const fechaFin = new Date(parto.Fec_fin);
                const fechaFinStr = formatDateLocal(fechaFin);
                if (!fechaFinStr) continue;

                const [year, month, day] = fechaFinStr.split('-').map(Number);

                const madre = await PorcinoModel.findByPk(parto.Id_Porcino);
                const nombreCerda = madre?.Nom_Porcino || madre?.Num_Chapeta || `Cerda #${parto.Id_Porcino}`;

                const lechones = await PorcinoModel.findAll({
                    where: {
                        Id_parto: parto.Id_parto,
                        Tipo_Cerdo: 'Lechon'
                    },
                    order: [['Id_Porcino', 'ASC']]
                });

                if (lechones.length === 0) continue;

                const criasPorDia = {};

                for (const lechon of lechones) {
                    const seguimientos = await SegCamadaModel.findAll({
                        where: {
                            Id_Porcino: lechon.Id_Porcino
                        },
                        order: [['Dia_Programado', 'ASC']]
                    });

                    const diasRegistrados = seguimientos
                        .map(seg => Number(seg.Dia_Programado))
                        .filter(dia => !isNaN(dia));

                    const ultimoDia = diasRegistrados.length > 0 ? Math.max(...diasRegistrados) : 0;
                    const nextDay = diasSeguimiento.find(dia => dia > ultimoDia);

                    if (!nextDay) continue;

                    if (!criasPorDia[nextDay]) {
                        criasPorDia[nextDay] = [];
                    }

                    criasPorDia[nextDay].push({
                        idPorcino: lechon.Id_Porcino,
                        numero: lechon.Num_Chapeta || lechon.Id_Porcino
                    });
                }

                for (const [diaStr, crias] of Object.entries(criasPorDia)) {
                    const dia = Number(diaStr);
                    const fechaProgramada = new Date(year, month - 1, day + (dia - 1));
                    const fechaProgStr = formatDateLocal(fechaProgramada);
                    if (!fechaProgStr) continue;

                    let tipo = null;
                    if (fechaProgStr === hoyStr) {
                        tipo = 'hoy';
                    } else if (fechaProgStr === mananaStr || fechaProgStr === enDosDiasStr) {
                        tipo = 'recordatorio';
                    } else if (fechaProgStr < hoyStr) {
                        tipo = 'atrasado';
                    }

                    if (!tipo) continue;

                    const criasTexto = crias.map(c => `#${c.numero}`).join(', ');
                    let mensaje = '';

                    if (tipo === 'hoy') {
                        mensaje = `¡Hoy es día de seguimiento! Registra el día ${dia} para las crías ${criasTexto} de ${nombreCerda} (Parto #${parto.Id_parto}).`;
                    } else if (tipo === 'recordatorio') {
                        mensaje = `Recordatorio: El ${fechaProgStr} toca el seguimiento del día ${dia} para crías ${criasTexto} de ${nombreCerda} (Parto #${parto.Id_parto}).`;
                    } else if (tipo === 'atrasado') {
                        mensaje = `⚠ Atrasado: Crías ${criasTexto} de ${nombreCerda} (Parto #${parto.Id_parto}) no registradas en día ${dia}. Fecha límite: ${fechaProgStr}.`;
                    }

                    notificaciones.push({
                        id: `camada-${parto.Id_parto}-${dia}`,
                        categoria: 'camada',
                        idParto: parto.Id_parto,
                        nombreCerda,
                        diaProgramado: dia,
                        fechaProgramada: fechaProgStr,
                        criasAtrasadas: tipo === 'atrasado' ? crias.map(c => c.numero) : null,
                        cantidadCrias: crias.length,
                        tipo,
                        titulo: `Seguimiento Camada - Día ${dia}`,
                        mensaje,
                        ruta: `/actividades_camada/parto/${parto.Id_parto}`
                    });
                }
            }
        } catch (errCamada) {
            console.error("Error cargando notificaciones de camada:", errCamada);
        }

        // =========================================================================
        // 2. CALENDARIO REPRODUCTIVO (Fechas proyectadas de cerdas en ciclo activo)
        // =========================================================================
        try {
            const calendarios = await CalendarioModel.findAll({
                include: [
                    {
                        model: ciclosModel,
                        as: 'ciclo',
                        where: {
                            Estado: 'Activo'
                        },
                        include: [
                            {
                                model: PorcinoModel,
                                as: 'porcino',
                                attributes: ['Id_Porcino', 'Nom_Porcino', 'Num_Chapeta']
                            }
                        ]
                    }
                ]
            });

            for (const cal of calendarios) {
                const nombreCerda = cal.ciclo?.porcino?.Nom_Porcino ||
                    cal.ciclo?.porcino?.Num_Chapeta ||
                    `Cerda #${cal.ciclo?.Id_Cerda || '—'}`;

                const eventosCalendario = [
                    {
                        clave: 'rc1',
                        nombre: '1er Control de Celo (RC1 - 21 días)',
                        fecha: cal.rc1,
                        realizada: cal.real_rc1,
                        descripcion: 'Verificar si la cerda repite celo a los 21 días post-servicio.'
                    },
                    {
                        clave: 'rc2',
                        nombre: '2do Control de Celo (RC2 - 42 días)',
                        fecha: cal.rc2,
                        realizada: cal.real_rc2,
                        descripcion: 'Confirmar ausencia de celo para asegurar diagnóstico de gestación (42 días).'
                    },
                    {
                        clave: 'cambio_alimento',
                        nombre: 'Ajuste de Alimento Gestación (Día 100)',
                        fecha: cal.cambio_alimento,
                        realizada: cal.real_cambio_alimento,
                        descripcion: 'Ajustar ración alimenticia y requerimientos nutricionales del último tercio.'
                    },
                    {
                        clave: 'dia_107',
                        nombre: 'Maternidad y Lavado (Día 107)',
                        fecha: cal.dia_107,
                        realizada: cal.real_dia_107,
                        descripcion: 'Bañar, desparasitar y trasladar la cerda a jaula de paritorio.'
                    },
                    {
                        clave: 'parto',
                        nombre: 'Fecha Estimada de Parto (Día 114)',
                        fecha: cal.parto,
                        realizada: cal.real_parto,
                        descripcion: 'Monitorear dilatación y preparar kit de asistencia de parto.'
                    }
                ];

                // Verificar si hubo recelo que cancela eventos posteriores
                const receloRc1 = cal.resultado_rc1 === 'recelo_detectado';
                const receloRc2 = cal.resultado_rc2 === 'recelo_detectado';

                for (const ev of eventosCalendario) {
                    if (ev.realizada) continue;
                    if (!ev.fecha) continue;

                    // Si recelo en RC1, solo RC1 aplica
                    if (receloRc1 && ev.clave !== 'rc1') continue;
                    // Si no hubo recelo en RC1 pero sí en RC2, solo RC1 y RC2 aplican
                    if (!receloRc1 && receloRc2 && ev.clave !== 'rc1' && ev.clave !== 'rc2') continue;

                    const evFechaStr = formatDateLocal(ev.fecha);
                    if (!evFechaStr) continue;

                    let tipo = null;
                    if (evFechaStr === hoyStr) {
                        tipo = 'hoy';
                    } else if (evFechaStr === mananaStr || evFechaStr === enDosDiasStr) {
                        tipo = 'recordatorio';
                    } else if (evFechaStr < hoyStr) {
                        tipo = 'atrasado';
                    }

                    if (!tipo) continue;

                    let mensaje = '';
                    if (tipo === 'hoy') {
                        mensaje = `¡Hoy! Toca registrar ${ev.nombre} para ${nombreCerda} (Ciclo #${cal.Id_Ciclo}).`;
                    } else if (tipo === 'recordatorio') {
                        mensaje = `Recordatorio: El ${evFechaStr} corresponde ${ev.nombre} para ${nombreCerda} (Ciclo #${cal.Id_Ciclo}).`;
                    } else if (tipo === 'atrasado') {
                        mensaje = `⚠ Atrasado: ${ev.nombre} para ${nombreCerda} venció el ${evFechaStr} y está pendiente de registro.`;
                    }

                    notificaciones.push({
                        id: `calendario-${cal.Id_Calendario}-${ev.clave}`,
                        categoria: 'calendario',
                        idCalendario: cal.Id_Calendario,
                        idCiclo: cal.Id_Ciclo,
                        nombreCerda,
                        eventoClave: ev.clave,
                        fechaProgramada: evFechaStr,
                        tipo,
                        titulo: ev.nombre,
                        mensaje,
                        ruta: `/calendario`
                    });
                }
            }
        } catch (errCal) {
            console.error("Error cargando notificaciones de calendario:", errCal);
        }

        // =========================================================================
        // 3. SEGUIMIENTO DE LA CERDA (Revisiones y tratamientos)
        // =========================================================================
        try {
            const seguimientosCerda = await Seguimiento_CerdaModel.findAll({
                where: {
                    Estado: 'Activo'
                },
                order: [['Id_Seguimiento_Cerda', 'DESC']],
                limit: 50
            });

            for (const seg of seguimientosCerda) {
                if (!seg.Fecha) continue;
                const segFechaStr = formatDateLocal(seg.Fecha);
                if (!segFechaStr) continue;

                let tipo = null;
                if (segFechaStr === hoyStr) {
                    tipo = 'hoy';
                } else if (segFechaStr === mananaStr) {
                    tipo = 'recordatorio';
                } else if (segFechaStr < hoyStr) {
                    // solo alertar si es reciente (últimos 7 días)
                    const diffDays = Math.round((new Date(hoyStr) - new Date(segFechaStr)) / (1000 * 60 * 60 * 24));
                    if (diffDays <= 7) {
                        tipo = 'atrasado';
                    }
                }

                if (!tipo) continue;

                let nombreCerda = `Cerda #${seg.Id_Porcino || '—'}`;
                if (seg.Id_Porcino) {
                    const cerda = await PorcinoModel.findByPk(seg.Id_Porcino, {
                        attributes: ['Id_Porcino', 'Nom_Porcino', 'Num_Chapeta']
                    });
                    if (cerda) {
                        nombreCerda = cerda.Nom_Porcino || cerda.Num_Chapeta || nombreCerda;
                    }
                }

                notificaciones.push({
                    id: `segcerda-${seg.Id_Seguimiento_Cerda}`,
                    categoria: 'cerda',
                    idSeguimientoCerda: seg.Id_Seguimiento_Cerda,
                    idPorcino: seg.Id_Porcino,
                    nombreCerda,
                    fechaProgramada: segFechaStr,
                    tipo,
                    titulo: `Seguimiento de Cerda #${seg.Id_Seguimiento_Cerda}`,
                    mensaje: seg.Observaciones ? `${nombreCerda}: ${seg.Observaciones}` : `Seguimiento clínico programado para ${nombreCerda}.`,
                    ruta: `/seguimiento_cerda`
                });
            }
        } catch (errCerda) {
            console.error("Error cargando notificaciones de seguimiento cerda:", errCerda);
        }

        // =========================================================================
        // 4. ORDENAR NOTIFICACIONES
        // =========================================================================
        const ordenPrioridad = {
            atrasado: 0,
            hoy: 1,
            recordatorio: 2
        };

        notificaciones.sort((a, b) => {
            const diffTipo = (ordenPrioridad[a.tipo] ?? 3) - (ordenPrioridad[b.tipo] ?? 3);
            if (diffTipo !== 0) return diffTipo;
            return String(a.fechaProgramada || '').localeCompare(String(b.fechaProgramada || ''));
        });

        res.status(200).json(notificaciones);

    } catch (error) {
        console.error("ERROR GENERAL EN NOTIFICACIONES:", error);
        res.status(500).json({
            message: error.message
        });
    }
};

export const toggleEstadoSegcamada = async (req, res) => {
    try {
        const { id } = req.params;

        const segcamada = await SegCamadaModel.findByPk(id);

        if (!segcamada) {
            return res.status(404).json({
                message: "Registro de seguimiento de camada no encontrado"
            });
        }

        segcamada.Estado =
            segcamada.Estado === "Activo"
                ? "Inactivo"
                : "Activo";

        await segcamada.save();

        res.status(200).json({
            message: "Estado del seguimiento actualizado",
            estado: segcamada.Estado
        });

    } catch (error) {
        console.error("Error cambiando estado del seguimiento:", error);

        res.status(500).json({
            message: error.message
        });
    }
};