import ResponsablesModel from '../models/responsablesModel.js'
import bcrypt from 'bcryptjs'
import jwt from 'jsonwebtoken'
import crypto from 'crypto'
import nodemailer from 'nodemailer'
import e from 'express'

class AuthService {

    async login(email, password) {
        console.log('🔐 Intentando login con:', email)
        
        const responsable = await ResponsablesModel.findOne({ where: { Email: email } })
        console.log('👤 Usuario encontrado:', responsable?.Email || 'NO ENCONTRADO')
        
        if (!responsable)
            throw new Error('Email o contraseña incorrectos')

        if (responsable.Estado === 'Inactivo')
            throw new Error('Tu cuenta está inactiva. Contacta al administrador.')

        console.log('🔑 Hash en BD:', responsable.Password)
        console.log('🔑 Password recibida:', password)
        
        const passwordValida = await bcrypt.compare(password, responsable.Password)
        console.log('✅ Password válida:', passwordValida)
        
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

        console.log(responsable)

        return {
            token,
            usuario: {
                id: responsable.Id_Responsable,
                nombres: responsable.Nombres,
                apellidos: responsable.Apellidos,
                email: responsable.Email,
                cargo: responsable.Cargo.toLowerCase()
            }
        }
    }

    async register(data) {
        const existente = await ResponsablesModel.findOne({ where: { Email: data.Email } })
        if (existente)
            throw new Error('Ya existe una cuenta con ese email')

        const existenteDoc = await ResponsablesModel.findOne({ where: { Documento: data.Documento } })
        if (existenteDoc)
            throw new Error('Ya existe una cuenta con ese documento')

        const passwordHash = await bcrypt.hash(data.Password, 10)

        const nuevoResponsable = await ResponsablesModel.create({
            ...data,
            Password: passwordHash,
            Estado: 'Activo'
        })

        return { message: 'Cuenta creada exitosamente', id: nuevoResponsable.Id_Responsable }
    }

    // ─── RECUPERACIÓN DE CONTRASEÑA ───────────────────────────────────────────

    async forgotPassword(email) {
        const responsable = await ResponsablesModel.findOne({ where: { Email: email } })

        // Por seguridad, siempre respondemos igual aunque el email no exista
        if (!responsable) return

        // Generar token aleatorio seguro (expira en 30 minutos)
        const resetToken = crypto.randomBytes(32).toString('hex')
        const resetTokenHash = crypto.createHash('sha256').update(resetToken).digest('hex')
        const expiracion = new Date(Date.now() + 30 * 60 * 1000) // 30 min
        console.log(`Token generado para ${email}: ${resetToken} (hash: ${resetTokenHash}, expira: ${expiracion})`)  // Para pruebas, mostrar token en consola
        // Guardar token hasheado y expiración en el usuario
        await responsable.update({
            ResetPasswordToken: resetTokenHash,
            ResetPasswordExpires: expiracion
        })

        // Construir enlace de reseteo
        const resetUrl = `${process.env.FRONTEND_URL}/reset-password?token=${resetToken}`

        console.log(`Enlace de recuperación para ${email}: ${resetUrl}`)  // Para pruebas, mostrar el enlace en consola

        // Enviar correo
        await this._enviarCorreoRecuperacion(responsable, resetUrl)
    }

    async resetPassword(token, nuevaPassword) {
        if (!token || !nuevaPassword)
            throw new Error('Token y nueva contraseña son requeridos')

        if (nuevaPassword.length < 8)
            throw new Error('La contraseña debe tener al menos 8 caracteres')

        // Hashear el token recibido para comparar con el guardado en BD
        const tokenHash = crypto.createHash('sha256').update(token).digest('hex')

        const responsable = await ResponsablesModel.findOne({
            where: {
                ResetPasswordToken: tokenHash,
            }
        })

        if (!responsable)
            throw new Error('El enlace de recuperación no es válido')

        // Verificar que no haya expirado
        if (new Date() > new Date(responsable.ResetPasswordExpires))
            throw new Error('El enlace de recuperación ha expirado. Solicita uno nuevo.')

        // Hashear nueva contraseña y limpiar token
        const passwordHash = await bcrypt.hash(nuevaPassword, 10)
        await responsable.update({
            Password: passwordHash,
            ResetPasswordToken: null,
            ResetPasswordExpires: null
        })
    }

    // ─── HELPER PRIVADO: envío de correo ─────────────────────────────────────

    async _enviarCorreoRecuperacion(responsable, resetUrl) {
        const transporter = nodemailer.createTransport({
            host: process.env.EMAIL_HOST,       // ej: smtp.gmail.com
            port: process.env.EMAIL_PORT || 587,
            secure: false,
            auth: {
                user: process.env.EMAIL_USER,   // tu correo
                pass: process.env.EMAIL_PASS    // contraseña o app password
            }
        })

        await transporter.sendMail({
            from: `"RepropIG" <${process.env.EMAIL_USER}>`,
            to: responsable.Email,
            subject: 'Recuperación de contraseña — RepropIG',
            html: `
                <div style="font-family: Arial, sans-serif; max-width: 480px; margin: auto; padding: 32px; background: #fff; border-radius: 12px; border: 1px solid #f0d0da;">
                    <div style="text-align: center; margin-bottom: 24px;">
                        <h2 style="color: #c06b84; margin: 0;">RepropIG</h2>
                    </div>
                    <p style="color: #333;">Hola, <strong>${responsable.Nombres}</strong>.</p>
                    <p style="color: #555; line-height: 1.6;">
                        Recibimos una solicitud para restablecer la contraseña de tu cuenta.
                        Haz clic en el botón de abajo para crear una nueva contraseña.
                    </p>
                    <div style="text-align: center; margin: 32px 0;">
                        <a href="${resetUrl}"
                           style="background: #d4849a; color: white; padding: 14px 32px; border-radius: 10px;
                                  text-decoration: none; font-weight: bold; font-size: 15px; display: inline-block;">
                            Restablecer contraseña
                        </a>
                    </div>
                    <p style="color: #999; font-size: 13px; line-height: 1.5;">
                        Este enlace expira en <strong>30 minutos</strong>.<br>
                        Si no solicitaste el cambio de contraseña, ignora este correo — tu cuenta está segura.
                    </p>
                    <hr style="border: none; border-top: 1px solid #f0d0da; margin: 24px 0;">
                    <p style="color: #bbb; font-size: 12px; text-align: center;">RepropIG · Sistema de gestión porcina</p>
                </div>
            `
        })
    }
}

export default new AuthService()