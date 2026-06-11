import reproduccionesModel from "../models/reproduccionesModel.js";
import PorcinoModel from "../models/porcinoModel.js";
import MontaModel from "../models/montaModel.js";
import InseminacionModel from "../models/inseminacionModel.js";

class reproduccionesService {

    async getAll() {
        return await reproduccionesModel.findAll({
            include: [
                { model: PorcinoModel, as: 'porcino', attributes: ['Nom_Porcino'] },
                { model: MontaModel, as: 'montas', attributes: ['Id_Monta', 'Fec_hora'] },           // 👈 agrega Fecha
                { model: InseminacionModel, as: 'inseminaciones', attributes: ['Id_Inseminacion', 'Fec_hora'] } // 👈 agrega Fecha
            ],
            order: [['Createdat', 'DESC']]
        })
    }

    async getById(id) {
        const reproduccion = await reproduccionesModel.findByPk(id, {
            include: [
                { model: PorcinoModel, as: 'porcino', attributes: ['Nom_Porcino'] },
                { model: MontaModel, as: 'montas', attributes: ['Id_Monta', 'Fec_hora'] },
                { model: InseminacionModel, as: 'inseminaciones', attributes: ['Id_Inseminacion', 'Fec_hora'] }
            ]
        })
        if (!reproduccion) throw new Error('Reproduccion no encontrada')
        return reproduccion
    }

    async create(data) {
        try {
            console.log("📥 Datos recibidos:", data);

            // Verificar si ya tiene una reproducción activa
            const existeActiva = await reproduccionesModel.findOne({
                where: {
                    Id_Cerda: data.Id_Cerda,
                    activo: 'S'
                }
            });

            if (existeActiva) {
                throw new Error('Esta cerda ya tiene una reproducción activa. Debes inactivarla antes de registrar una nueva.');
            }

            const nueva = await reproduccionesModel.create({
                Id_Cerda: data.Id_Cerda,
                TipoReproduccion: data.TipoReproduccion,
                activo: 'S'
            });
            console.log("✅ Guardado con ID:", nueva.Id_Reproduccion);
            return nueva;
        } catch (error) {
            console.error("❌ Error al guardar:", error.message);
            throw error;
        }
    }

    async update(id, data) {
        const reproduccion = await reproduccionesModel.findByPk(id)
        if (!reproduccion) throw new Error('Reproduccion no encontrada')

        // Actualizar campos manualmente para asegurar que activo se asigne
        reproduccion.Id_Cerda = data.Id_Cerda || reproduccion.Id_Cerda
        reproduccion.activo = data.activo || data.Activo || reproduccion.activo
        reproduccion.TipoReproduccion = data.TipoReproduccion || reproduccion.TipoReproduccion

        await reproduccion.save()
        return true
    }

    async toggleActivo(id) {
        const reproduccion = await reproduccionesModel.findByPk(id)
        if (!reproduccion) throw new Error('Reproduccion no encontrada')

        // Normalizar comparación a Mayúscula por si acaso
        const estadoActual = (reproduccion.activo || 'N').toUpperCase()
        const nuevoEstado = estadoActual === 'S' ? 'N' : 'S'

        // Si se va a activar, verificar que no tenga ya una activa
        if (nuevoEstado === 'S') {
            const existeActiva = await reproduccionesModel.findOne({
                where: {
                    Id_Cerda: reproduccion.Id_Cerda,
                    activo: 'S'
                }
            });

            if (existeActiva) {
                throw new Error('Esta cerda ya tiene una reproducción activa. Debes inactivarla antes de reactivar esta.');
            }
        }

        reproduccion.activo = nuevoEstado
        await reproduccion.save()

        return nuevoEstado
    }

    async delete(id) {
        const reproduccion = await reproduccionesModel.findByPk(id)
        if (!reproduccion) throw new Error('Reproduccion no encontrada')

        // Borrar montas e inseminaciones relacionadas primero
        await MontaModel.destroy({ where: { Id_Reproduccion: id } })
        await InseminacionModel.destroy({ where: { Id_Reproduccion: id } })

        // Luego borrar la reproducción
        await reproduccionesModel.destroy({ where: { Id_Reproduccion: id } })
        return true
    }
}

export default new reproduccionesService()