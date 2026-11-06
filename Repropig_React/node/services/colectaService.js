import colectaModel from "../models/colectaModel.js";
import PorcinoModel from "../models/porcinoModel.js";

class colectaService {

    async getAll() {
        try {
            return await colectaModel.findAll({
                include: [{
                    model: PorcinoModel,
                    as: 'porcino',
                    attributes: ['Id_Porcino', 'Nom_Porcino', 'Num_Chapeta']
                }]
            })
        } catch (err) {
            console.error('Error al incluir porcino en colectas:', err)
            return await colectaModel.findAll()
        }
    }

    async getById(id) {
        const colecta = await colectaModel.findByPk(id)
        if (!colecta) throw new Error('Colecta no encontrada');
        return colecta;
    }

    async create(data) {
        if (data.volumen !== undefined && data.volumen !== null && Number(data.volumen) < 0) {
            throw new Error('El volumen no puede ser un número negativo.');
        }
        if (data.cant_generada !== undefined && data.cant_generada !== null && Number(data.cant_generada) < 0) {
            throw new Error('La cantidad de pajillas generadas no puede ser un número negativo.');
        }
        if (data.cant_utilizada !== undefined && data.cant_utilizada !== null && Number(data.cant_utilizada) < 0) {
            throw new Error('La cantidad de pajillas utilizadas no puede ser un número negativo.');
        }
        return await colectaModel.create(data)
    }

    async update(id, data) {
        if (data.volumen !== undefined && data.volumen !== null && Number(data.volumen) < 0) {
            throw new Error('El volumen no puede ser un número negativo.');
        }
        if (data.cant_generada !== undefined && data.cant_generada !== null && Number(data.cant_generada) < 0) {
            throw new Error('La cantidad de pajillas generadas no puede ser un número negativo.');
        }
        if (data.cant_utilizada !== undefined && data.cant_utilizada !== null && Number(data.cant_utilizada) < 0) {
            throw new Error('La cantidad de pajillas utilizadas no puede ser un número negativo.');
        }
        const colecta = await colectaModel.findByPk(id)
        if (!colecta) throw new Error('Colecta no encontrada')
        await colectaModel.update(data, { where: { Id_colecta: id } })
        return true
    }

    async delete(id) {
        const colecta = await colectaModel.findByPk(id)
        if (!colecta) throw new Error('Colecta no encontrada')

        // ✅ Verificar que no tenga inseminaciones asociadas
        const { default: inseminacionModel } = await import('../models/inseminacionModel.js')
        const inseminaciones = await inseminacionModel.count({ where: { Id_colecta: id } })
        if (inseminaciones > 0) {
            throw new Error(`No se puede eliminar: tiene ${inseminaciones} inseminación(es) asociada(s)`)
        }

        await colectaModel.destroy({ where: { Id_colecta: id } })
        return true
    }
}

export default new colectaService()