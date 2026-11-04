import inseminacionModel from "../models/inseminacionModel.js";
import PorcinoModel from "../models/porcinoModel.js";
import colectaModel from "../models/colectaModel.js";
import db from "../database/db.js";

class inseminacionService {

    async getAll() {
        return await inseminacionModel.findAll({
            include: [{
                model: PorcinoModel,
                as: 'porcino',
                attributes: ['Nom_Porcino']
            }],
            order: [['Id_Inseminacion', 'DESC']]
        })
    }

    async getById(id) {
        const inseminacion = await inseminacionModel.findByPk(id)
        if (!inseminacion) throw new Error('Inseminacion no encontrada');
        return inseminacion;
    }

    async create(data) {
        return await db.transaction(async (t) => {
            const { Id_colecta, cantidad } = data

            if (Id_colecta && cantidad) {
                // Bloqueo de fila para evitar condiciones de carrera concurrentes
                const colecta = await colectaModel.findByPk(Id_colecta, {
                    transaction: t,
                    lock: t.LOCK.UPDATE
                })
                if (!colecta) throw new Error('Colecta no encontrada')

                const disponibles = Number(colecta.cant_generada) - Number(colecta.cant_utilizada)
                const cantNum = Number(cantidad)

                if (cantNum <= 0) {
                    throw new Error('La cantidad de pajillas debe ser mayor a cero')
                }

                if (cantNum > disponibles) {
                    throw new Error(`Inventario insuficiente: Solo hay ${disponibles} pajilla(s) disponible(s) en la colecta seleccionada`)
                }

                const inseminacion = await inseminacionModel.create(data, { transaction: t })
                await colectaModel.update(
                    { cant_utilizada: Number(colecta.cant_utilizada) + cantNum },
                    { where: { Id_colecta }, transaction: t }
                )
                return inseminacion
            }

            return await inseminacionModel.create(data, { transaction: t })
        })
    }

    async update(id, data) {
        return await db.transaction(async (t) => {
            const inseminacion = await inseminacionModel.findByPk(id, {
                transaction: t,
                lock: t.LOCK.UPDATE
            })
            if (!inseminacion) throw new Error('Inseminacion no encontrada')

            const cantidadAnterior = Number(inseminacion.cantidad) || 0
            const cantidadNueva = Number(data.cantidad !== undefined ? data.cantidad : cantidadAnterior)
            const idColecta = data.Id_colecta || inseminacion.Id_colecta

            if (idColecta !== inseminacion.Id_colecta && inseminacion.Id_colecta) {
                // Cambió la colecta: devolver a la vieja, descontar de la nueva con lock
                const oldColecta = await colectaModel.findByPk(inseminacion.Id_colecta, {
                    transaction: t,
                    lock: t.LOCK.UPDATE
                })
                const newColecta = await colectaModel.findByPk(idColecta, {
                    transaction: t,
                    lock: t.LOCK.UPDATE
                })
                if (!newColecta) throw new Error('Nueva colecta no encontrada')

                const disponiblesNueva = Number(newColecta.cant_generada) - Number(newColecta.cant_utilizada)
                if (cantidadNueva > disponiblesNueva) {
                    throw new Error(`No hay suficientes pajillas en la nueva colecta. Disponibles: ${disponiblesNueva}`)
                }

                await inseminacionModel.update(data, { where: { Id_Inseminacion: id }, transaction: t })

                if (oldColecta) {
                    await colectaModel.update(
                        { cant_utilizada: Math.max(0, Number(oldColecta.cant_utilizada) - cantidadAnterior) },
                        { where: { Id_colecta: inseminacion.Id_colecta }, transaction: t }
                    )
                }
                await colectaModel.update(
                    { cant_utilizada: Number(newColecta.cant_utilizada) + cantidadNueva },
                    { where: { Id_colecta: idColecta }, transaction: t }
                )
                return true
            }

            if (idColecta && data.cantidad !== undefined) {
                const colecta = await colectaModel.findByPk(idColecta, {
                    transaction: t,
                    lock: t.LOCK.UPDATE
                })
                if (!colecta) throw new Error('Colecta no encontrada')

                const diferencia = cantidadNueva - cantidadAnterior
                const disponibles = Number(colecta.cant_generada) - Number(colecta.cant_utilizada)

                if (diferencia > disponibles) {
                    throw new Error(`Inventario insuficiente. Disponibles actuales: ${disponibles + cantidadAnterior}`)
                }

                await inseminacionModel.update(data, { where: { Id_Inseminacion: id }, transaction: t })

                await colectaModel.update(
                    { cant_utilizada: Number(colecta.cant_utilizada) + Number(diferencia) },
                    { where: { Id_colecta: idColecta }, transaction: t }
                )
                return true
            }

            await inseminacionModel.update(data, { where: { Id_Inseminacion: id }, transaction: t })
            return true
        })
    }

    async delete(id) {
        return await db.transaction(async (t) => {
            const inseminacion = await inseminacionModel.findByPk(id, {
                transaction: t,
                lock: t.LOCK.UPDATE
            })
            if (!inseminacion) throw new Error('Inseminacion no encontrada')

            if (inseminacion.Id_colecta && inseminacion.cantidad) {
                const colecta = await colectaModel.findByPk(inseminacion.Id_colecta, {
                    transaction: t,
                    lock: t.LOCK.UPDATE
                })
                if (colecta) {
                    await colectaModel.update(
                        { cant_utilizada: Math.max(0, Number(colecta.cant_utilizada) - Number(inseminacion.cantidad)) },
                        { where: { Id_colecta: inseminacion.Id_colecta }, transaction: t }
                    )
                }
            }

            await inseminacionModel.destroy({ where: { Id_Inseminacion: id }, transaction: t })
            return true
        })
    }
}

export default new inseminacionService()