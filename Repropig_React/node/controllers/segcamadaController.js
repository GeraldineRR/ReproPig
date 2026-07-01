import SegcamadaService from "../services/segcamadaService.js";
import SegCamadaModel from "../models/SegCamadaModel.js";
import CriaModel from "../models/criaModel.js";
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

export const getSegCamadaByCria = async (req, res) => {
    const { idCria } = req.params;

    try {
        const registros = await SegCamadaModel.findAll({
            where: { Id_Cria: idCria },
            order: [['Dia_Programado', 'ASC']] // Para obtener el último día fácilmente
        });

        res.status(200).json(registros);

    } catch (error) {
        console.error("Error obteniendo registros por cría:", error);
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

        // Helper: format a Date using LOCAL components (avoids UTC shift)
        const formatDateLocal = (d) => {
            const y = d.getFullYear();
            const m = String(d.getMonth() + 1).padStart(2, '0');
            const day = String(d.getDate()).padStart(2, '0');
            return `${y}-${m}-${day}`;
        };

        // Get today and tomorrow dates (local timezone)
        const hoy = new Date();
        const hoyStr = formatDateLocal(hoy);
        const manana = new Date(hoy);
        manana.setDate(manana.getDate() + 1);
        const mananaStr = formatDateLocal(manana);

        // Get all partos with their crias alive
        const partos = await PartosModel.findAll({
            where: { estado: 'Activo' },
            include: [
                {
                    model: PorcinoModel,
                    as: 'porcino',
                    attributes: ['Nom_Porcino']
                },
                {
                    model: CriaModel,
                    as: 'crias',
                    where: { Estado: 'Vivo' },
                    required: true,
                    include: [
                        {
                            model: SegCamadaModel,
                            as: 'segcamada',
                            attributes: ['Dia_Programado'],
                            required: false
                        }
                    ]
                }
            ]
        });

        const notificaciones = [];

        for (const parto of partos) {
            if (!parto.Fec_fin) continue;

            // Parse the DB date using UTC getters (MySQL dates are stored as UTC midnight)
            const fechaFinStr = parto.Fec_fin instanceof Date
                ? parto.Fec_fin.toISOString().split('T')[0]
                : String(parto.Fec_fin).split('T')[0];
            const [yp, mp, dp] = fechaFinStr.split('-').map(Number);

            const nombreCerda = parto.porcino?.Nom_Porcino || 'Sin nombre';

            // Group crias by their next pending day
            const criasPorDia = {};

            for (const cria of parto.crias) {
                const diasRegistrados = (cria.segcamada || []).map(s => s.Dia_Programado);
                const ultimoDia = diasRegistrados.length > 0 ? Math.max(...diasRegistrados) : 0;

                const nextDay = diasSeguimiento.find(d => d > ultimoDia);
                if (!nextDay) continue; // All 28 days already tracked

                if (!criasPorDia[nextDay]) {
                    criasPorDia[nextDay] = [];
                }
                criasPorDia[nextDay].push(cria.Num_Cria);
            }

            // For each pending day, determine notification type
            for (const [diaStr, criasNums] of Object.entries(criasPorDia)) {
                const dia = Number(diaStr);
                const fechaProgramada = new Date(yp, mp - 1, dp + (dia - 1));
                const fechaProgStr = formatDateLocal(fechaProgramada);

                let tipo = null;
                if (fechaProgStr === hoyStr) {
                    tipo = 'hoy';
                } else if (fechaProgStr === mananaStr) {
                    tipo = 'recordatorio';
                } else if (fechaProgStr < hoyStr) {
                    tipo = 'atrasado';
                }

                if (tipo) {
                    let mensaje = '';
                    const criasTexto = criasNums.map(n => `#${n}`).join(', ');

                    if (tipo === 'hoy') {
                        mensaje = `¡Hoy es día de seguimiento! Registra el día ${dia} para las crías de ${nombreCerda} (Parto #${parto.Id_parto})`;
                    } else if (tipo === 'recordatorio') {
                        mensaje = `Recordatorio: Mañana (${fechaProgStr}) toca el registro de seguimiento del día ${dia} para las crías de ${nombreCerda} (Parto #${parto.Id_parto})`;
                    } else if (tipo === 'atrasado') {
                        mensaje = `⚠ Atrasado: ${criasNums.length === 1 ? `La cría ${criasTexto} no fue registrada` : `Las crías ${criasTexto} no fueron registradas`} en el día ${dia} de seguimiento de ${nombreCerda} (Parto #${parto.Id_parto}). Fecha programada: ${fechaProgStr}`;
                    }

                    notificaciones.push({
                        idParto: parto.Id_parto,
                        nombreCerda,
                        diaProgramado: dia,
                        fechaProgramada: fechaProgStr,
                        criasAtrasadas: tipo === 'atrasado' ? criasNums : null,
                        cantidadCrias: criasNums.length,
                        tipo,
                        mensaje
                    });
                }
            }
        }

        // Sort: atrasado first, then hoy, then recordatorio
        const orden = { atrasado: 0, hoy: 1, recordatorio: 2 };
        notificaciones.sort((a, b) => (orden[a.tipo] ?? 3) - (orden[b.tipo] ?? 3));

        res.status(200).json(notificaciones);

    } catch (error) {
        console.error("Error obteniendo notificaciones de seguimiento:", error);
        res.status(500).json({ message: error.message });
    }
};