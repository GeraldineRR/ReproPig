import NovedadesModel from "../models/novedadesModel.js";
import PorcinoModel from "../models/porcinoModel.js";
import ciclosModel from "../models/ciclosModel.js";
import PartosModel from "../models/PartosModel.js";
import CalendarioModel from "../models/CalendarioModel.js";
import { Op } from "sequelize";

// Helper para restaurar el porcino y reactivar su ciclo si no tiene otras bajas
const restaurarPorcinoYCiclo = async (idPorcino) => {
    if (!idPorcino) return;

    // 1. Verificar si el porcino aún tiene alguna OTRA novedad de baja activa
    const tiposBaja = ['Muerte', 'Descarte', 'Traslado'];
    const otraBaja = await NovedadesModel.findOne({
        where: {
            Id_Porcino: idPorcino,
            Tipo_Novedad: tiposBaja
        }
    });

    if (otraBaja) {
        // Si aún tiene otra baja, sincronizar con ese estado correspondiente
        const estadoCorrespondiente = otraBaja.Tipo_Novedad === 'Muerte' ? 'Muerto' : otraBaja.Tipo_Novedad === 'Traslado' ? 'Trasladado' : 'Inactivo';
        await PorcinoModel.update({ Estado: estadoCorrespondiente }, { where: { Id_Porcino: idPorcino } });
        return;
    }

    // 2. Si ya no tiene ninguna novedad de baja, restaurar el estado del porcino a 'Activo'
    await PorcinoModel.update({ Estado: 'Activo' }, { where: { Id_Porcino: idPorcino } });

    // 3. Verificar si el porcino ya tiene un ciclo activo
    const cicloActivoExistente = await ciclosModel.findOne({
        where: { Id_Cerda: idPorcino, Estado: 'Activo' }
    });

    if (!cicloActivoExistente) {
        // Buscar el ciclo más reciente de la cerda
        const ultimoCiclo = await ciclosModel.findOne({
            where: { Id_Cerda: idPorcino },
            order: [['Id_Ciclo', 'DESC']]
        });

        if (ultimoCiclo) {
            // Verificar si el ciclo ya estaba finalizado por parto o fallido por recelo
            const hayParto = (await PartosModel.count({ where: { Id_Ciclo: ultimoCiclo.Id_Ciclo } })) > 0;
            const cal = await CalendarioModel.findOne({ where: { Id_Ciclo: ultimoCiclo.Id_Ciclo } });
            const tienePartoReal = Boolean(cal && cal.real_parto);
            const tieneRecelo = Boolean(cal && (cal.resultado_rc1 === 'recelo_detectado' || cal.resultado_rc2 === 'recelo_detectado'));

            // Si el ciclo no estaba finalizado por parto ni fallido por recelo, volverlo a Activo
            if (!hayParto && !tienePartoReal && !tieneRecelo) {
                await ultimoCiclo.update({ Estado: 'Activo' });
            }
        }
    }
};

export const getAllNovedades = async (req, res) => {
    try {
        const novedades = await NovedadesModel.findAll({
            where: {
                Causa_Motivo: { [Op.notIn]: ['Nacido muerto', 'Momia'] }
            },
            include: [
                {
                    model: PorcinoModel,
                    as: 'porcino',
                    attributes: ['Id_Porcino', 'Nom_Porcino', 'Num_Chapeta', 'Tipo_Cerdo', 'Estado']
                }
            ],
            order: [['Id_Novedad', 'DESC']]
        });
        res.json(novedades);
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

export const getNovedad = async (req, res) => {
    try {
        const novedad = await NovedadesModel.findByPk(req.params.id);
        if (!novedad) return res.status(404).json({ message: "No encontrada" });
        res.json(novedad);
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

export const createNovedad = async (req, res) => {
    try {
        const { Id_Porcino, Tipo_Novedad } = req.body;

        const tiposBaja = ['Muerte', 'Descarte', 'Traslado'];

        if (tiposBaja.includes(Tipo_Novedad)) {
            // Verificar si el porcino ya tiene una novedad previa de Muerte, Descarte o Traslado
            const existente = await NovedadesModel.findOne({
                where: {
                    Id_Porcino,
                    Tipo_Novedad: tiposBaja
                }
            });
            if (existente) {
                return res.status(400).json({
                    message: `El porcino #${Id_Porcino} ya cuenta con un registro previo de ${existente.Tipo_Novedad}. No se permiten duplicados.`
                });
            }

            // Verificar si el porcino ya está inactivo, muerto o trasladado
            const porcino = await PorcinoModel.findByPk(Id_Porcino);
            if (porcino && ['Muerto', 'Inactivo', 'Trasladado'].includes(porcino.Estado)) {
                return res.status(400).json({
                    message: `El porcino #${Id_Porcino} ya se encuentra registrado como ${porcino.Estado}. No se puede registrar ${Tipo_Novedad} nuevamente.`
                });
            }
        }

        const novedad = await NovedadesModel.create(req.body);

        // Actualizar el estado del porcino en la base de datos y detener ciclos reproductivos activos
        if (tiposBaja.includes(Tipo_Novedad)) {
            const nuevoEstado = Tipo_Novedad === 'Muerte' ? 'Muerto' : Tipo_Novedad === 'Traslado' ? 'Trasladado' : 'Inactivo';
            await PorcinoModel.update({ Estado: nuevoEstado }, { where: { Id_Porcino } });

            // Detener cualquier ciclo reproductivo activo del porcino
            await ciclosModel.update(
                { Estado: 'Inactivo' },
                { where: { Id_Cerda: Id_Porcino, Estado: 'Activo' } }
            );
        }

        res.status(201).json({ message: "Creada exitosamente", novedad });
    } catch (error) {
        res.status(400).json({ message: error.message });
    }
};

export const updateNovedad = async (req, res) => {
    try {
        const { Id_Porcino, Tipo_Novedad } = req.body;
        const { id } = req.params;
        const tiposBaja = ['Muerte', 'Descarte', 'Traslado'];

        const novedadActual = await NovedadesModel.findByPk(id);
        if (!novedadActual) {
            return res.status(404).json({ message: "Novedad no encontrada" });
        }

        const prevPorcinoId = novedadActual.Id_Porcino;
        const prevTipo = novedadActual.Tipo_Novedad;
        const nuevoPorcinoId = Id_Porcino || prevPorcinoId;
        const nuevoTipo = Tipo_Novedad || prevTipo;

        if (tiposBaja.includes(nuevoTipo)) {
            const existente = await NovedadesModel.findOne({
                where: {
                    Id_Porcino: nuevoPorcinoId,
                    Tipo_Novedad: tiposBaja,
                    Id_Novedad: { [Op.ne]: id }
                }
            });
            if (existente) {
                return res.status(400).json({
                    message: `El porcino #${nuevoPorcinoId} ya cuenta con otro registro de ${existente.Tipo_Novedad}. No se permiten duplicados.`
                });
            }
        }

        await NovedadesModel.update(req.body, { where: { Id_Novedad: id } });

        // Si el nuevo tipo es de baja, actualizar estado del porcino y detener ciclo activo
        if (tiposBaja.includes(nuevoTipo)) {
            const nuevoEstado = nuevoTipo === 'Muerte' ? 'Muerto' : nuevoTipo === 'Traslado' ? 'Trasladado' : 'Inactivo';
            await PorcinoModel.update({ Estado: nuevoEstado }, { where: { Id_Porcino: nuevoPorcinoId } });

            // Detener cualquier ciclo reproductivo activo del porcino
            await ciclosModel.update(
                { Estado: 'Inactivo' },
                { where: { Id_Cerda: nuevoPorcinoId, Estado: 'Activo' } }
            );
        }

        // Si antes era de baja y ahora YA NO es de baja (o cambió de porcino),
        // restaurar el porcino anterior y su ciclo a la normalidad
        if (tiposBaja.includes(prevTipo) && (!tiposBaja.includes(nuevoTipo) || Number(prevPorcinoId) !== Number(nuevoPorcinoId))) {
            await restaurarPorcinoYCiclo(prevPorcinoId);
        }

        res.json({ message: "Actualizada" });
    } catch (error) {
        res.status(400).json({ message: error.message });
    }
};

export const deleteNovedad = async (req, res) => {
    try {
        const { id } = req.params;
        const novedad = await NovedadesModel.findByPk(id);
        if (!novedad) return res.status(404).json({ message: "No encontrada" });

        const porcinoId = novedad.Id_Porcino;
        const eraBaja = ['Muerte', 'Descarte', 'Traslado'].includes(novedad.Tipo_Novedad);

        await NovedadesModel.destroy({ where: { Id_Novedad: id } });

        if (eraBaja && porcinoId) {
            await restaurarPorcinoYCiclo(porcinoId);
        }

        res.json({ message: "Eliminada" });
    } catch (error) {
        res.status(400).json({ message: error.message });
    }
};
