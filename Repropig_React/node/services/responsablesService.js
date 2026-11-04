import ResponsablesModel from "../models/responsablesModel.js"
import bcrypt from 'bcryptjs'

const CAMPOS_PROTEGIDOS = ['Password', 'ResetPasswordToken', 'ResetPasswordExpires']

class ResponsablesService {

    async getAll() {
        return await ResponsablesModel.findAll({
            attributes: { exclude: CAMPOS_PROTEGIDOS },
            order: [['Id_Responsable', 'ASC']]
        })
    }

    async getById(id) {
        const responsable = await ResponsablesModel.findByPk(id, {
            attributes: { exclude: CAMPOS_PROTEGIDOS }
        })
        if (!responsable) throw new Error('Responsable no encontrado')
        return responsable
    }

    async create(data) {
        // Filtrado estricto contra asignación masiva
        const sanitizado = {
            Nombres: data.Nombres,
            Apellidos: data.Apellidos,
            Documento: data.Documento,
            Cargo: data.Cargo,
            Telefono: data.Telefono,
            Email: data.Email,
            Estado: data.Estado || 'Activo'
        }

        if (data.Password && data.Password.length >= 6) {
            sanitizado.Password = await bcrypt.hash(data.Password, 10);
        } else if (data.Password) {
            throw new Error('La contraseña debe tener al menos 6 caracteres')
        }

        const nuevo = await ResponsablesModel.create(sanitizado)
        const resultado = nuevo.toJSON()
        CAMPOS_PROTEGIDOS.forEach(campo => delete resultado[campo])
        return resultado
    }

    async update(id, data) {
        const responsable = await ResponsablesModel.findByPk(id)
        if (!responsable) throw new Error('Responsable no encontrado')

        const camposPermitidos = ['Nombres', 'Apellidos', 'Documento', 'Cargo', 'Telefono', 'Email', 'Estado']
        const updateData = {}
        for (const campo of camposPermitidos) {
            if (data[campo] !== undefined) {
                updateData[campo] = data[campo]
            }
        }

        if (data.Password && data.Password.trim() !== "") {
            if (data.Password.length < 6) {
                throw new Error('La nueva contraseña debe tener al menos 6 caracteres')
            }
            updateData.Password = await bcrypt.hash(data.Password, 10)
        }

        await ResponsablesModel.update(updateData, { where: { Id_Responsable: id } })
        return true
    }

    async delete(id) {
        const deleted = await ResponsablesModel.destroy({ where: { Id_Responsable: id } })
        if (!deleted) throw new Error('Responsable no encontrado')
        return true
    }

    // ✅ Nuevo: verificar contraseña actual y actualizar
    async cambiarContrasena(id, contrasenaActual, contrasenaNueva) {
        const responsable = await ResponsablesModel.findByPk(id)
        if (!responsable) throw new Error('Responsable no encontrado')

        // Verificar que la contraseña actual sea correcta
        const esValida = await bcrypt.compare(contrasenaActual, responsable.Password)
        if (!esValida) throw new Error('La contraseña actual es incorrecta')

        // Hashear y guardar la nueva
        const hasheada = await bcrypt.hash(contrasenaNueva, 10)
        await ResponsablesModel.update(
            { Password: hasheada },
            { where: { Id_Responsable: id } }
        )
        return true
    }
}

export default new ResponsablesService()