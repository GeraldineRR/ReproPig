import colectaModel from "../models/colectaModel.js";
import PorcinoModel from "../models/porcinoModel.js";

class colectaService {

    esVencida(colecta) {
        if (!colecta || !colecta.Fecha) return false;
        const fechaCol = new Date(colecta.Fecha);
        const diasValidez = colecta.Tipo === 'Externo' ? 5 : 3;
        const expDate = new Date(fechaCol.getTime() + diasValidez * 24 * 60 * 60 * 1000);
        return new Date() > expDate;
    }

    async getAll() {
        try {
            const colectas = await colectaModel.findAll({
                include: [{
                    model: PorcinoModel,
                    as: 'porcino',
                    attributes: ['Nom_Porcino']
                }],
                order: [['Id_colecta', 'DESC']]
            })

            // ✅ Control automático de colectas vencidas:
            // Toda colecta que haya superado su vigencia se marca automáticamente como Inactiva
            for (const col of colectas) {
                if (col.Estado === 'Activo' && this.esVencida(col)) {
                    col.Estado = 'Inactivo';
                    await colectaModel.update({ Estado: 'Inactivo' }, { where: { Id_colecta: col.Id_colecta } });
                }
            }

            return colectas
        } catch (err) {
            console.error('Error al incluir porcino en colectas:', err)
            return await colectaModel.findAll({ order: [['Id_colecta', 'DESC']] })
        }
    }

    async getById(id) {
        const colecta = await colectaModel.findByPk(id, {
            include: [{
                model: PorcinoModel,
                as: 'porcino',
                attributes: ['Nom_Porcino']
            }]
        })
        if (!colecta) throw new Error('Colecta no encontrada');

        if (colecta.Estado === 'Activo' && this.esVencida(colecta)) {
            colecta.Estado = 'Inactivo';
            await colectaModel.update({ Estado: 'Inactivo' }, { where: { Id_colecta: id } });
        }

        return colecta;
    }

    async create(data) {
        return await colectaModel.create(data)
    }

    async update(id, data) {
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