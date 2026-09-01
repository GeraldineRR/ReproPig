import ciclosModel from "../models/ciclosModel.js";
import PorcinoModel from "../models/porcinoModel.js";
import MontaModel from "../models/montaModel.js";
import InseminacionModel from "../models/inseminacionModel.js";
import colectaModel from "../models/colectaModel.js";

class ciclosService {

    async getAll() {
        return await ciclosModel.findAll({
            include: [
                { model: PorcinoModel, as: 'porcino', attributes: ['Id_Porcino', 'Nom_Porcino'] },
                {
                    model: MontaModel,
                    as: 'montas',
                    separate: true,
                    include: [{ model: PorcinoModel, as: 'cerdo', attributes: ['Id_Porcino', 'Nom_Porcino'] }]
                },
                {
                    model: InseminacionModel,
                    as: 'inseminaciones',
                    separate: true,
                    include: [{
                        model: colectaModel,
                        as: 'colecta',
                        include: [{ model: PorcinoModel, as: 'porcino', attributes: ['Id_Porcino', 'Nom_Porcino'] }]
                    }]
                }
            ]
        })
    }

    async getById(id) {
        const ciclo = await ciclosModel.findByPk(id, {
            include: [
                { model: PorcinoModel, as: 'porcino', attributes: ['Id_Porcino', 'Nom_Porcino'] },
                {
                    model: MontaModel,
                    as: 'montas',
                    separate: true,
                    include: [{ model: PorcinoModel, as: 'cerdo', attributes: ['Id_Porcino', 'Nom_Porcino'] }]
                },
                {
                    model: InseminacionModel,
                    as: 'inseminaciones',
                    separate: true,
                    include: [{
                        model: colectaModel,
                        as: 'colecta',
                        include: [{ model: PorcinoModel, as: 'porcino', attributes: ['Id_Porcino', 'Nom_Porcino'] }]
                    }]
                }
            ]
        })
        if (!ciclo) throw new Error('Ciclo no encontrada')
        return ciclo
    }

    async create(data) {
        try {
            console.log("📥 Datos recibidos:", data);

            const existeActiva = await ciclosModel.findOne({
                where: { Id_Cerda: data.Id_Cerda, Estado: 'Activo' }
            });

            if (existeActiva) {
                throw new Error('Esta cerda ya tiene un ciclo activo. Debes inactivarla antes de registrar una nueva.');
            }

            const nueva = await ciclosModel.create({
                Id_Cerda: data.Id_Cerda,
                TipoCiclo: data.TipoCiclo,
                Estado: 'Activo'
            });
            console.log("✅ Guardado con ID:", nueva.Id_Ciclo);
            return nueva;
        } catch (error) {
            console.error("❌ Error al guardar:", error.message);
            throw error;
        }
    }

    async update(id, data) {
        const ciclo = await ciclosModel.findByPk(id)
        if (!ciclo) throw new Error('Ciclo no encontrada')
        ciclo.Id_Cerda = data.Id_Cerda || ciclo.Id_Cerda
        ciclo.Estado = data.Estado || ciclo.Estado
        ciclo.TipoCiclo = data.TipoCiclo || ciclo.TipoCiclo
        await ciclo.save()
        return true
    }

    async toggleEstado(id) {
        const ciclo = await ciclosModel.findByPk(id)
        if (!ciclo) throw new Error('Ciclo no encontrada')

        const estadoActual = ciclo.Estado || 'Inactivo'
        const nuevoEstado = estadoActual === 'Activo' ? 'Inactivo' : 'Activo'

        if (nuevoEstado === 'Activo') {
            const existeActiva = await ciclosModel.findOne({
                where: { Id_Cerda: ciclo.Id_Cerda, Estado: 'Activo' }
            });
            if (existeActiva) {
                throw new Error('Esta cerda ya tiene un ciclo activo. Debes inactivarla antes de reactivar esta.');
            }
        }

        ciclo.Estado = nuevoEstado
        await ciclo.save()
        return nuevoEstado
    }

    async delete(id) {
        const ciclo = await ciclosModel.findByPk(id)
        if (!ciclo) throw new Error('Ciclo no encontrada')
        await MontaModel.destroy({ where: { Id_Ciclo: id } })
        await InseminacionModel.destroy({ where: { Id_Ciclo: id } })
        await ciclosModel.destroy({ where: { Id_Ciclo: id } })
        return true
    }
}

export default new ciclosService()