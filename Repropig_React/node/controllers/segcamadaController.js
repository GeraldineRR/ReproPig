import SegcamadaService from "../services/segcamadaService.js";
import SegCamadaModel from "../models/segcamadaModel.js";
import PartosModel from "../models/PartosModel.js";
import PorcinoModel from "../models/porcinoModel.js";
import CalendarioModel from "../models/CalendarioModel.js";
import ciclosModel from "../models/ciclosModel.js";
import Seguimiento_CerdaModel from "../models/Seguimiento_CerdaModel.js";
import { Op } from "sequelize";

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

        // Formatear fecha YYYY-MM-DD de forma segura sin desfase UTC
        const formatDateLocal = (dateVal) => {
            if (!dateVal) return null;
            if (typeof dateVal === 'string') {
                const str = dateVal.split('T')[0].split(' ')[0].trim();
                if (/^\d{4}-\d{2}-\d{2}$/.test(str)) {
                    return str;
                }
            }
            if (dateVal instanceof Date && !isNaN(dateVal.getTime())) {
                const y = dateVal.getFullYear();
                const m = String(dateVal.getMonth() + 1).padStart(2, '0');
                const d = String(dateVal.getDate()).padStart(2, '0');
                return `${y}-${m}-${d}`;
            }
            const strVal = String(dateVal).split('T')[0].split(' ')[0].trim();
            if (/^\d{4}-\d{2}-\d{2}$/.test(strVal)) {
                return strVal;
            }
            return null;
        };

        // Proyectar fecha sumando días de forma exacta local
        const proyectarFecha = (fechaBaseStr, dias) => {
            if (!fechaBaseStr) return null;
            const clean = String(fechaBaseStr).split('T')[0].split(' ')[0].trim();
            const [y, m, d] = clean.split('-').map(Number);
            if (!y || !m || !d) return null;
            const dateObj = new Date(y, m - 1, d, 12, 0, 0);
            dateObj.setDate(dateObj.getDate() + dias);
            const yyyy = dateObj.getFullYear();
            const mm = String(dateObj.getMonth() + 1).padStart(2, '0');
            const dd = String(dateObj.getDate()).padStart(2, '0');
            return `${yyyy}-${mm}-${dd}`;
        };

        const getTodayLocal = (offsetDays = 0) => {
            const d = new Date();
            if (offsetDays !== 0) d.setDate(d.getDate() + offsetDays);
            const year = d.getFullYear();
            const month = String(d.getMonth() + 1).padStart(2, '0');
            const day = String(d.getDate()).padStart(2, '0');
            return `${year}-${month}-${day}`;
        };

        const hoyStr = getTodayLocal(0);
        const mananaStr = getTodayLocal(1);
        const enDosDiasStr = getTodayLocal(2);

        const notificaciones = [];

        // =========================================================================
        // 1. SEGUIMIENTO DE CAMADA (Lechones en partos activos)
        // =========================================================================
        try {
            const partos = await PartosModel.findAll({
                where: {
                    estado: 'Activo'
                },
                include: [
                    {
                        model: PorcinoModel,
                        as: 'porcino',
                        attributes: ['Id_Porcino', 'Nom_Porcino', 'Num_Chapeta']
                    }
                ],
                order: [['Id_parto', 'DESC']]
            });

            for (const parto of partos) {
                const fechaFinStr = formatDateLocal(parto.Fec_fin || parto.Fec_inicio);
                if (!fechaFinStr) continue;

                const [year, month, day] = fechaFinStr.split('-').map(Number);

                const madre = parto.porcino;
                const nombreCerda = madre?.Nom_Porcino || madre?.Num_Chapeta || `Cerda #${parto.Id_Porcino}`;

                const lechones = await PorcinoModel.findAll({
                    where: {
                        Id_parto: parto.Id_parto,
                        Tipo_Cerdo: 'Lechon',
                        Gen_Porcino: { [Op.ne]: '-' }
                    },
                    include: [
                        {
                            model: SegCamadaModel,
                            as: 'segcamadas',
                            required: false,
                            attributes: ['Id_SegCamada', 'Id_Porcino', 'Dia_Programado', 'Peso_Cria', 'Fecha_Real', 'Estado']
                        }
                    ],
                    order: [['Id_Porcino', 'ASC']]
                });

                // VERIFICAR LECHONES FALTANTES (REGISTRO INCOMPLETO)
                const nacVivos = parto.Nac_vivos || 0;
                const registradosVivos = lechones.length;

                if (nacVivos > registradosVivos) {
                    const faltantes = nacVivos - registradosVivos;
                    notificaciones.push({
                        id: `parto-incompleto-${parto.Id_parto}`,
                        categoria: 'camada',
                        tipo: 'atrasado',
                        titulo: `Registro de lechones incompleto`,
                        mensaje: `⚠️ Faltan ${faltantes} lechones por registrar del parto de ${nombreCerda} (${nacVivos} nacidos vivos, solo ${registradosVivos} registrados).`,
                        ruta: `/partos`,
                        idParto: parto.Id_parto,
                        faltantes: faltantes,
                        nacVivos: nacVivos,
                        registrados: registradosVivos,
                        fecNac: parto.Fec_inicio,
                        nombreMadre: nombreCerda
                    });
                }

                if (lechones.length === 0) continue;

                // =========================================================================
                // ALERTA DE PESO A LOS 21 DÍAS DE LOS LECHONES
                // =========================================================================
                const lechonesVivos = lechones.filter(l => l.Estado !== 'Muerto');

                // Verificar si un lechón tiene peso registrado (en ficha o en seguimientos)
                const tienePesoRegistrado = (l) => {
                    const segs = l.segcamadas || [];
                    // 1. Verificar peso en segcamada
                    const tieneSegConPeso = segs.some(s =>
                        s.Peso_Cria !== null &&
                        s.Peso_Cria !== undefined &&
                        Number(s.Peso_Cria) > 0 &&
                        (!s.Estado || s.Estado.toLowerCase() === 'activo')
                    );
                    if (tieneSegConPeso) return true;

                    // 2. Verificar peso al nacer registrado en la ficha del lechón
                    if (l.Pes_Nacer !== null && l.Pes_Nacer !== undefined && Number(l.Pes_Nacer) > 0) {
                        return true;
                    }

                    // 3. Fallback en caso de que exista columna Pes_21_Dias
                    if (l.Pes_21_Dias !== null && l.Pes_21_Dias !== undefined && Number(l.Pes_21_Dias) > 0) {
                        return true;
                    }

                    return false;
                };

                const lechonesSinPeso21 = lechonesVivos.filter(l => !tienePesoRegistrado(l));

                if (lechonesSinPeso21.length > 0) {
                    const fecBase = lechones[0]?.Fec_Nac_Porcino || parto.Fec_fin || parto.Fec_inicio;
                    if (fecBase) {
                        const fecBaseStr = formatDateLocal(fecBase);
                        if (fecBaseStr) {
                            const fecha21Str = proyectarFecha(fecBaseStr, 21);
                            const [by, bm, bd] = fecha21Str.split('-').map(Number);
                            const fecha21 = new Date(by, bm - 1, bd);

                            const [hy, hm, hd] = hoyStr.split('-').map(Number);
                            const dHoy = new Date(hy, hm - 1, hd);
                            const diffDays = Math.round((fecha21.getTime() - dHoy.getTime()) / (1000 * 60 * 60 * 24));

                            let tipoPeso21 = null;
                            let tituloPeso21 = '';
                            let mensajePeso21 = '';

                            if (diffDays > 0 && diffDays <= 3) {
                                tipoPeso21 = 'recordatorio';
                                tituloPeso21 = 'Recordatorio: Peso a los 21 días';
                                mensajePeso21 = diffDays === 1
                                    ? `Recordatorio: Mañana se cumplen los 21 días de la camada de ${nombreCerda} (Parto #${parto.Id_parto}). Alista el registro de peso a los 21 días.`
                                    : `Recordatorio: En ${diffDays} días se cumplen los 21 días de la camada de ${nombreCerda} (Parto #${parto.Id_parto}). Recuerda registrar el peso a los 21 días de ${lechonesSinPeso21.length} lechón(es).`;
                            } else if (diffDays === 0) {
                                tipoPeso21 = 'hoy';
                                tituloPeso21 = '¡Hoy! Peso a los 21 días';
                                mensajePeso21 = `¡Hoy se cumplen los 21 días de la camada de ${nombreCerda} (Parto #${parto.Id_parto})! Debes registrar el peso a los 21 días para ${lechonesSinPeso21.length} lechón(es).`;
                            } else if (diffDays < 0 && diffDays >= -30) {
                                tipoPeso21 = 'atrasado';
                                tituloPeso21 = 'Atrasado: Peso a los 21 días';
                                mensajePeso21 = `⚠️ Atrasado: Han pasado ${Math.abs(diffDays)} días desde los 21 días de la camada de ${nombreCerda} (Parto #${parto.Id_parto}) y ${lechonesSinPeso21.length} lechón(es) aún no tienen peso registrado.`;
                            }

                            if (tipoPeso21) {
                                notificaciones.push({
                                    id: `peso-21d-${parto.Id_parto}`,
                                    categoria: 'camada',
                                    subcategoria: 'peso_21_dias',
                                    tipo: tipoPeso21,
                                    titulo: tituloPeso21,
                                    mensaje: mensajePeso21,
                                    ruta: `/partos`,
                                    idParto: parto.Id_parto,
                                    fechaProgramada: fecha21Str,
                                    fecha21: fecha21Str,
                                    diasDiferencia: diffDays,
                                    cantidadPendientes: lechonesSinPeso21.length,
                                    nombreMadre: nombreCerda
                                });
                            }
                        }
                    }
                }

                const criasPorDia = {};

                for (const lechon of lechones) {
                    const seguimientos = lechon.segcamadas || [];

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
                    const fechaProgramada = new Date(year, month - 1, day, 12, 0, 0);
                    fechaProgramada.setDate(fechaProgramada.getDate() + (dia - 1));
                    const resY = fechaProgramada.getFullYear();
                    const resM = String(fechaProgramada.getMonth() + 1).padStart(2, '0');
                    const resD = String(fechaProgramada.getDate()).padStart(2, '0');
                    const fechaProgStr = `${resY}-${resM}-${resD}`;

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

                const fechaServicioStr = formatDateLocal(cal.Fecha_Servicio);

                const eventosCalendario = [
                    {
                        clave: 'rc1',
                        dias: 21,
                        nombre: '1er Control de Celo (RC1 - 21 días)',
                        fecha: fechaServicioStr ? proyectarFecha(fechaServicioStr, 21) : formatDateLocal(cal.rc1),
                        realizada: cal.real_rc1,
                        descripcion: 'Verificar si la cerda repite celo a los 21 días post-servicio.'
                    },
                    {
                        clave: 'rc2',
                        dias: 42,
                        nombre: '2do Control de Celo (RC2 - 42 días)',
                        fecha: fechaServicioStr ? proyectarFecha(fechaServicioStr, 42) : formatDateLocal(cal.rc2),
                        realizada: cal.real_rc2,
                        descripcion: 'Confirmar ausencia de celo para asegurar diagnóstico de gestación (42 días).'
                    },
                    {
                        clave: 'cambio_alimento',
                        dias: 100,
                        nombre: 'Ajuste de Alimento Gestación (Día 100)',
                        fecha: fechaServicioStr ? proyectarFecha(fechaServicioStr, 100) : formatDateLocal(cal.cambio_alimento),
                        realizada: cal.real_cambio_alimento,
                        descripcion: 'Ajustar ración alimenticia y requerimientos nutricionales del último tercio.'
                    },
                    {
                        clave: 'dia_107',
                        dias: 107,
                        nombre: 'Maternidad y Lavado (Día 107)',
                        fecha: fechaServicioStr ? proyectarFecha(fechaServicioStr, 107) : formatDateLocal(cal.dia_107),
                        realizada: cal.real_dia_107,
                        descripcion: 'Bañar, desparasitar y trasladar la cerda a jaula de paritorio.'
                    },
                    {
                        clave: 'parto',
                        dias: 114,
                        nombre: 'Fecha Estimada de Parto (Día 114)',
                        fecha: fechaServicioStr ? proyectarFecha(fechaServicioStr, 114) : formatDateLocal(cal.parto),
                        realizada: cal.real_parto,
                        descripcion: 'Monitorear dilatación y preparar kit de asistencia de parto.'
                    }
                ];

                // Verificar si hubo recelo que detiene las etapas posteriores
                const receloRc1 = cal.resultado_rc1 === 'recelo_detectado';
                const receloRc2 = cal.resultado_rc2 === 'recelo_detectado';

                for (const ev of eventosCalendario) {
                    if (ev.realizada) continue;
                    if (!ev.fecha) continue;

                    // Si hubo recelo en RC1, ninguna etapa posterior aplica
                    if (receloRc1 && ev.clave !== 'rc1') continue;
                    // Si hubo recelo en RC2, las etapas posteriores no aplican
                    if (receloRc2 && ev.clave !== 'rc1' && ev.clave !== 'rc2') continue;

                    // Validar secuencia lógica de prerequisitos
                    if (ev.clave === 'rc2' && !cal.real_rc1) continue;
                    if (ev.clave === 'cambio_alimento' && !cal.real_rc2) continue;
                    if (ev.clave === 'dia_107' && !cal.real_rc2) continue;
                    if (ev.clave === 'parto' && !cal.real_rc2) continue;

                    const evFechaStr = ev.fecha;
                    const [ey, em, ed] = evFechaStr.split('-').map(Number);
                    const evDate = new Date(ey, em - 1, ed);

                    const [hy, hm, hd] = hoyStr.split('-').map(Number);
                    const hoyDate = new Date(hy, hm - 1, hd);
                    const diffDays = Math.round((evDate.getTime() - hoyDate.getTime()) / (1000 * 60 * 60 * 24));

                    let tipo = null;
                    if (diffDays === 0) {
                        tipo = 'hoy';
                    } else if (diffDays > 0 && diffDays <= 3) {
                        tipo = 'recordatorio';
                    } else if (diffDays < 0 && diffDays >= -60) {
                        tipo = 'atrasado';
                    }

                    if (!tipo) continue;

                    let mensaje = '';
                    if (tipo === 'hoy') {
                        mensaje = `¡Hoy! Toca registrar ${ev.nombre} para ${nombreCerda} (Ciclo #${cal.Id_Ciclo}). Fecha proyectada: ${evFechaStr}.`;
                    } else if (tipo === 'recordatorio') {
                        mensaje = diffDays === 1
                            ? `Recordatorio: Mañana corresponde ${ev.nombre} para ${nombreCerda} (Ciclo #${cal.Id_Ciclo}). Fecha proyectada: ${evFechaStr}.`
                            : `Recordatorio: En ${diffDays} días (${evFechaStr}) corresponde ${ev.nombre} para ${nombreCerda} (Ciclo #${cal.Id_Ciclo}).`;
                    } else if (tipo === 'atrasado') {
                        mensaje = `⚠️ Atrasado: ${ev.nombre} para ${nombreCerda} debió realizarse el ${evFechaStr} (hace ${Math.abs(diffDays)} días) y está pendiente de registro.`;
                    }

                    notificaciones.push({
                        id: `calendario-${cal.Id_Calendario}-${ev.clave}`,
                        categoria: 'calendario',
                        idCalendario: cal.Id_Calendario,
                        idCiclo: cal.Id_Ciclo,
                        nombreCerda,
                        eventoClave: ev.clave,
                        fechaProgramada: evFechaStr,
                        diasDiferencia: diffDays,
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
        // 3. ORDENAR NOTIFICACIONES
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