import ResponsablesModel from '../models/responsablesModel.js'
import bcrypt from 'bcryptjs'
import jwt from 'jsonwebtoken'
import crypto from 'crypto'
import nodemailer from 'nodemailer'

// Control de intentos fallidos en memoria para mitigación de fuerza bruta
const intentosFallidos = new Map() // email -> { count, lockedUntil }
const MAX_INTENTOS = 5
const TIEMPO_BLOQUEO_MS = 15 * 60 * 1000 // 15 minutos

class AuthService {

    async login(email, password) {
        const emailNormalizado = String(email || '').trim().toLowerCase()
        const ahora = Date.now()

        // Verificar si la cuenta está bloqueada temporalmente
        const intento = intentosFallidos.get(emailNormalizado)
        if (intento && intento.lockedUntil && intento.lockedUntil > ahora) {
            const minutosRestantes = Math.ceil((intento.lockedUntil - ahora) / 60000)
            throw new Error(`Cuenta bloqueada temporalmente por exceso de intentos fallidos. Por favor espera ${minutosRestantes} minuto(s).`)
        }

        const responsable = await ResponsablesModel.findOne({ where: { Email: emailNormalizado } })
        
        if (!responsable) {
            this._registrarIntentoFallido(emailNormalizado)
            throw new Error('Email o contraseña incorrectos')
        }

        if (responsable.Estado === 'Inactivo') {
            throw new Error('Tu cuenta está inactiva. Contacta al instructor administrador.')
        }

        const passwordValida = await bcrypt.compare(password, responsable.Password)
        
        if (!passwordValida) {
            this._registrarIntentoFallido(emailNormalizado)
            throw new Error('Email o contraseña incorrectos')
        }

        // Login exitoso: restablecer intentos fallidos
        intentosFallidos.delete(emailNormalizado)

        const jwtSecret = process.env.JWT_SECRET || 'repropig_sena_la_granja_secret_token_secure_2026_98374'

        const token = jwt.sign(
            {
                id: responsable.Id_Responsable,
                email: responsable.Email,
                cargo: responsable.Cargo,
                nombres: responsable.Nombres,
                apellidos: responsable.Apellidos
            },
            jwtSecret,
            { expiresIn: '8h' }
        )

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

    _registrarIntentoFallido(email) {
        const ahora = Date.now()
        const registro = intentosFallidos.get(email) || { count: 0, lockedUntil: null }
        registro.count += 1

        if (registro.count >= MAX_INTENTOS) {
            registro.lockedUntil = ahora + TIEMPO_BLOQUEO_MS
            registro.count = 0
        }
        intentosFallidos.set(email, registro)
    }

    async register(data) {
        const existente = await ResponsablesModel.findOne({ where: { Email: data.Email } })
        if (existente)
            throw new Error('Ya existe una cuenta con ese email')

        const existenteDoc = await ResponsablesModel.findOne({ where: { Documento: data.Documento } })
        if (existenteDoc)
            throw new Error('Ya existe una cuenta con ese documento')

        if (!data.Password || data.Password.length < 6) {
            throw new Error('La contraseña debe tener al menos 6 caracteres')
        }

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
        const emailNormalizado = String(email || '').trim().toLowerCase()
        const responsable = await ResponsablesModel.findOne({ where: { Email: emailNormalizado } })

        // Por seguridad, siempre respondemos igual aunque el email no exista
        if (!responsable) return

        // Generar token aleatorio seguro (expira en 30 minutos)
        const resetToken = crypto.randomBytes(32).toString('hex')
        const resetTokenHash = crypto.createHash('sha256').update(resetToken).digest('hex')
        const expiracion = new Date(Date.now() + 30 * 60 * 1000) // 30 min

        // Guardar token hasheado y expiración en el usuario
        await responsable.update({
            ResetPasswordToken: resetTokenHash,
            ResetPasswordExpires: expiracion
        })

        // Construir enlace de reseteo
        const frontendUrl = process.env.FRONTEND_URL || 'http://localhost:5173'
        const resetUrl = `${frontendUrl}/reset-password?token=${resetToken}`

        // Enviar correo
        try {
            await this._enviarCorreoRecuperacion(responsable, resetUrl)
        } catch (mailError) {
            console.error('Error al enviar correo de recuperación (verificar credenciales SMTP):', mailError.message)
        }
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