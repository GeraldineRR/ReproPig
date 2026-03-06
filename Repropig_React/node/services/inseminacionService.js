import inseminacionModel from "../models/inseminacionModel.js";
import PorcinoModel from "../models/porcinoModel.js";
import colectaModel from "../models/colectaModel.js";

class inseminacionService {

    async getAll() {
        return await inseminacionModel.findAll({
            include: [{
                model: PorcinoModel,
                as: 'porcino',
                attributes: ['Nom_Porcino']
            }]
        })
    }

    async getById(id) {
        const inseminacion = await inseminacionModel.findByPk(id)
        if (!inseminacion) throw new Error('Inseminacion no encontrada');
        return inseminacion;
    }

    async create(data) {
        const { Id_colecta, cantidad } = data

        if (Id_colecta && cantidad) {
            const colecta = await colectaModel.findByPk(Id_colecta)
            if (!colecta) throw new Error('Colecta no encontrada')

            const disponibles = Number(colecta.cant_generada) - Number(colecta.cant_utilizada)
            if (cantidad > disponibles) {
                throw new Error(`No hay suficientes pajillas. Disponibles: ${disponibles}`)
            }

            // ✅ Crear inseminación y actualizar cant_utilizada
            const inseminacion = await inseminacionModel.create(data)
            await colectaModel.update(
                { cant_utilizada: Number(colecta.cant_utilizada) + Number(cantidad) },
                { where: { Id_colecta } }
            )
            return inseminacion
        }

        return await inseminacionModel.create(data)
    }

    async update(id, data) {
        const inseminacion = await inseminacionModel.findByPk(id)
        if (!inseminacion) throw new Error('Inseminacion no encontrada')

        const cantidadAnterior = Number(inseminacion.cantidad)
        const cantidadNueva = Number(data.cantidad)
        const idColecta = data.Id_colecta || inseminacion.Id_colecta

        if (idColecta && data.cantidad !== undefined) {
            const colecta = await colectaModel.findByPk(idColecta)
            if (!colecta) throw new Error('Colecta no encontrada')

            // Diferencia entre cantidad nueva y anterior
            const diferencia = cantidadNueva - cantidadAnterior
            const disponibles = Number(colecta.cant_generada) - Number(colecta.cant_utilizada)

            if (diferencia > disponibles) {
                throw new Error(`No hay suficientes pajillas. Disponibles: ${disponibles + cantidadAnterior}`)
            }

            await inseminacionModel.update(data, { where: { Id_Inseminacion: id } })

            // ✅ Actualizar cant_utilizada con la diferencia
            await colectaModel.update(
                { cant_utilizada: Number(colecta.cant_utilizada) + Number(diferencia) },
                { where: { Id_colecta: idColecta } }
            )
            return true
        }

        await inseminacionModel.update(data, { where: { Id_Inseminacion: id } })
        return true
    }

    async delete(id) {
        const inseminacion = await inseminacionModel.findByPk(id)
        if (!inseminacion) throw new Error('Inseminacion no encontrada')

        // ✅ Devolver pajillas a la colecta al eliminar
        if (inseminacion.Id_colecta && inseminacion.cantidad) {
            const colecta = await colectaModel.findByPk(inseminacion.Id_colecta)
            if (colecta) {
                await colectaModel.update(
                    { cant_utilizada: Math.max(0, Number(colecta.cant_utilizada) - Number(inseminacion.cantidad)) },
                    { where: { Id_colecta: inseminacion.Id_colecta } }
                )
            }
        }

        await inseminacionModel.destroy({ where: { Id_Inseminacion: id } })
        return true
    }
}

export default new inseminacionService()