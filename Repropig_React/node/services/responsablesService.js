import ResponsablesModel from "../models/responsablesModel.js"
import bcrypt from 'bcryptjs'

class ResponsablesService {

    async getAll() {
        return await ResponsablesModel.findAll()
    }

    async getById(id) {
        const responsable = await ResponsablesModel.findByPk(id)
        if (!responsable) throw new Error('Responsable no encontrado')
        return responsable
    }

    async create(data) {
        if (data.Password) {
            data.Password = await bcrypt.hash(data.Password, 10);
        }
        return await ResponsablesModel.create(data)
    }

    async update(id, data) {
        const responsable = await ResponsablesModel.findByPk(id)
        if (!responsable) throw new Error('Responsable no encontrado')

        if (data.Password && data.Password.trim() !== "") {
            data.Password = await bcrypt.hash(data.Password, 10)
        } else {
            delete data.Password
        }

        await ResponsablesModel.update(data, { where: { Id_Responsable: id } })
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