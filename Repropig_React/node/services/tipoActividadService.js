import TipoActividadModel from "../models/tipoActividadModel.js";
import { Op } from "sequelize";

class TipoActividadService {
    async getAll() {
        return await TipoActividadModel.findAll({
            order: [['Id_Tipo', 'DESC']]
        });
    }

    async getById(id) {
        const tipo = await TipoActividadModel.findByPk(id);
        if (!tipo) throw new Error('Tipo de actividad no encontrado');
        return tipo;
    }

    async create(data) {
        const nombreTrim = data.Nombre ? data.Nombre.trim() : '';
        if (!nombreTrim) {
            throw new Error('El nombre de la actividad es obligatorio');
        }

        const existe = await TipoActividadModel.findOne({
            where: { Nombre: nombreTrim }
        });

        if (existe) {
            throw new Error('Ya existe un tipo de actividad con este nombre');
        }

        return await TipoActividadModel.create({
            Nombre: nombreTrim,
            Descripcion: data.Descripcion || null,
            Estado: data.Estado || 'Activo'
        });
    }

    async update(id, data) {
        const tipo = await TipoActividadModel.findByPk(id);
        if (!tipo) throw new Error('Tipo de actividad no encontrado');

        if (data.Nombre) {
            const nombreTrim = data.Nombre.trim();
            const existe = await TipoActividadModel.findOne({
                where: {
                    Nombre: nombreTrim,
                    Id_Tipo: { [Op.ne]: id }
                }
            });
            if (existe) {
                throw new Error('Ya existe otro tipo de actividad con este nombre');
            }
            tipo.Nombre = nombreTrim;
        }

        if (data.Descripcion !== undefined) {
            tipo.Descripcion = data.Descripcion;
        }

        if (data.Estado !== undefined) {
            tipo.Estado = data.Estado;
        }

        await tipo.save();
        return tipo;
    }

    async toggleEstado(id) {
        const tipo = await TipoActividadModel.findByPk(id);
        if (!tipo) throw new Error('Tipo de actividad no encontrado');

        const nuevoEstado = (tipo.Estado === 'Activo' || !tipo.Estado) ? 'Inactivo' : 'Activo';
        tipo.Estado = nuevoEstado;
        await tipo.save();
        return tipo;
    }

    async delete(id) {
        const deleted = await TipoActividadModel.destroy({ where: { Id_Tipo: id } });
        if (!deleted) throw new Error('Tipo de actividad no encontrado');
        return true;
    }
}

export default new TipoActividadService();
