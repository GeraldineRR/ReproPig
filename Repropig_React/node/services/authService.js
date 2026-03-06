import ResponsablesModel from '../models/responsablesModel.js'
import bcrypt from 'bcryptjs'
import jwt from 'jsonwebtoken'

class AuthService {

    async login(email, password) {
        const responsable = await ResponsablesModel.findOne({ where: { Email: email } })
        if (!responsable)
            throw new Error('Email o contraseña incorrectos')

        if (responsable.Estado === 'Inactivo')
            throw new Error('Tu cuenta está inactiva. Contacta al administrador.')

        const passwordValida = await bcrypt.compare(password, responsable.Password)
        if (!passwordValida)
            throw new Error('Email o contraseña incorrectos')

        const token = jwt.sign(
            {
                id: responsable.Id_Responsable,
                email: responsable.Email,
                cargo: responsable.Cargo,
                nombres: responsable.Nombres,
                apellidos: responsable.Apellidos
            },
            process.env.JWT_SECRET || 'repropig_secret_2024',
            { expiresIn: '8h' }
        )

        return {
            token,
            usuario: {
                id: responsable.Id_Responsable,
                nombres: responsable.Nombres,
                apellidos: responsable.Apellidos,
                email: responsable.Email,
                cargo: responsable.Cargo
            }
        }
    }

    async register(data) {
        // Verificar que el email no exista
        const existente = await ResponsablesModel.findOne({ where: { Email: data.Email } })
        if (existente)
            throw new Error('Ya existe una cuenta con ese email')

        // Verificar que el documento no exista
        const existenteDoc = await ResponsablesModel.findOne({ where: { Documento: data.Documento } })
        if (existenteDoc)
            throw new Error('Ya existe una cuenta con ese documento')

        // Hashear contraseña
        const passwordHash = await bcrypt.hash(data.Password, 10)

        const nuevoResponsable = await ResponsablesModel.create({
            ...data,
            Password: passwordHash,
            Estado: 'Activo'
        })

        return { message: 'Cuenta creada exitosamente', id: nuevoResponsable.Id_Responsable }
    }
}

export default new AuthService()