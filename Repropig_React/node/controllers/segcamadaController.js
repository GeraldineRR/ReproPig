import SegcamadaService from "../services/segcamadaService.js";
import SegCamadaModel from "../models/segcamadaModel.js";
import PartosModel from "../models/PartosModel.js";
import PorcinoModel from "../models/porcinoModel.js";

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

        // Formatear fecha YYYY-MM-DD usando hora local
        const formatDateLocal = (date) => {
            const year = date.getFullYear();
            const month = String(date.getMonth() + 1).padStart(2, '0');
            const day = String(date.getDate()).padStart(2, '0');

            return `${year}-${month}-${day}`;
        };

        const hoy = new Date();
        const hoyStr = formatDateLocal(hoy);

        const manana = new Date(hoy);
        manana.setDate(manana.getDate() + 1);

        const mananaStr = formatDateLocal(manana);

        // ==========================================
        // 1. BUSCAR PARTOS ACTIVOS
        // ==========================================

        const partos = await PartosModel.findAll({
            where: {
                estado: 'Activo'
            },
            order: [['Id_parto', 'DESC']]
        });

        const notificaciones = [];

        // ==========================================
        // 2. RECORRER CADA PARTO
        // ==========================================

        for (const parto of partos) {

            if (!parto.Fec_fin) {
                continue;
            }

            // Fecha del parto
            const fechaFin = new Date(parto.Fec_fin);

            const fechaFinStr = formatDateLocal(fechaFin);

            const [year, month, day] = fechaFinStr
                .split('-')
                .map(Number);

            // ==========================================
            // 3. BUSCAR LA MADRE
            // ==========================================

            const madre = await PorcinoModel.findByPk(
                parto.Id_Porcino
            );

            const nombreCerda =
                madre?.Nom_Porcino || 'Sin nombre';

            // ==========================================
            // 4. BUSCAR LOS LECHONES DEL PARTO
            // ==========================================

            const lechones = await PorcinoModel.findAll({
                where: {
                    Id_parto: parto.Id_parto,
                    Tipo_Cerdo: 'Lechon'
                },
                order: [['Id_Porcino', 'ASC']]
            });

            // Si no hay lechones, no hay seguimiento
            if (lechones.length === 0) {
                continue;
            }

            // ==========================================
            // 5. AGRUPAR LECHONES POR PRÓXIMO DÍA
            // ==========================================

            const criasPorDia = {};

            for (const lechon of lechones) {

                // Buscar seguimientos realizados para este lechón
                const seguimientos = await SegCamadaModel.findAll({
                    where: {
                        Id_Porcino: lechon.Id_Porcino
                    },
                    order: [['Dia_Programado', 'ASC']]
                });

                const diasRegistrados = seguimientos
                    .map(seg => Number(seg.Dia_Programado))
                    .filter(dia => !isNaN(dia));

                const ultimoDia =
                    diasRegistrados.length > 0
                        ? Math.max(...diasRegistrados)
                        : 0;

                // Buscar el siguiente día pendiente
                const nextDay = diasSeguimiento.find(
                    dia => dia > ultimoDia
                );

                // Ya completó los 28 días
                if (!nextDay) {
                    continue;
                }

                if (!criasPorDia[nextDay]) {
                    criasPorDia[nextDay] = [];
                }

                criasPorDia[nextDay].push({
                    idPorcino: lechon.Id_Porcino,
                    numero: lechon.Num_Chapeta || lechon.Id_Porcino
                });
            }

            // ==========================================
            // 6. CREAR NOTIFICACIONES
            // ==========================================

            for (const [diaStr, crias] of Object.entries(criasPorDia)) {

                const dia = Number(diaStr);

                // Día 1 = fecha del parto
                // Día 3 = fecha del parto + 2
                const fechaProgramada = new Date(
                    year,
                    month - 1,
                    day + (dia - 1)
                );

                const fechaProgStr =
                    formatDateLocal(fechaProgramada);

                let tipo = null;

                if (fechaProgStr === hoyStr) {

                    tipo = 'hoy';

                } else if (fechaProgStr === mananaStr) {

                    tipo = 'recordatorio';

                } else if (fechaProgStr < hoyStr) {

                    tipo = 'atrasado';
                }

                // Si todavía no corresponde mostrar
                if (!tipo) {
                    continue;
                }

                const criasTexto = crias
                    .map(cria => `#${cria.numero}`)
                    .join(', ');

                let mensaje = '';

                if (tipo === 'hoy') {

                    mensaje =
                        `¡Hoy es día de seguimiento! ` +
                        `Registra el día ${dia} para las crías ` +
                        `${criasTexto} de ${nombreCerda} ` +
                        `(Parto #${parto.Id_parto})`;

                } else if (tipo === 'recordatorio') {

                    mensaje =
                        `Recordatorio: Mañana (${fechaProgStr}) ` +
                        `toca el registro de seguimiento del día ${dia} ` +
                        `para las crías ${criasTexto} de ${nombreCerda} ` +
                        `(Parto #${parto.Id_parto})`;

                } else if (tipo === 'atrasado') {

                    mensaje =
                        `⚠ Atrasado: ` +
                        `${crias.length === 1
                            ? `La cría ${criasTexto} no fue registrada`
                            : `Las crías ${criasTexto} no fueron registradas`
                        } ` +
                        `en el día ${dia} de seguimiento de ${nombreCerda} ` +
                        `(Parto #${parto.Id_parto}). ` +
                        `Fecha programada: ${fechaProgStr}`;
                }

                notificaciones.push({
                    idParto: parto.Id_parto,
                    nombreCerda,
                    diaProgramado: dia,
                    fechaProgramada: fechaProgStr,

                    criasAtrasadas:
                        tipo === 'atrasado'
                            ? crias.map(cria => cria.numero)
                            : null,

                    cantidadCrias: crias.length,
                    tipo,
                    mensaje
                });
            }
        }

        // ==========================================
        // 7. ORDENAR NOTIFICACIONES
        // ==========================================

        const orden = {
            atrasado: 0,
            hoy: 1,
            recordatorio: 2
        };

        notificaciones.sort(
            (a, b) =>
                (orden[a.tipo] ?? 3) -
                (orden[b.tipo] ?? 3)
        );

        // ==========================================
        // 8. RESPONDER AL FRONTEND
        // ==========================================

        res.status(200).json(notificaciones);

    } catch (error) {

        console.error(
            "ERROR EN NOTIFICACIONES:",
            error
        );

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