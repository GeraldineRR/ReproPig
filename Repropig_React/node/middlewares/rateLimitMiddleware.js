import rateLimit from 'express-rate-limit';

// Limitador estricto para autenticación y recuperación de contraseñas
// Previene ataques de fuerza bruta y bombardeo de correos SMTP
export const authRateLimiter = rateLimit({
    windowMs: 15 * 60 * 1000, // 15 minutos
    max: 10, // máximo 10 intentos por IP
    standardHeaders: true,
    legacyHeaders: false,
    message: {
        success: false,
        message: 'Demasiados intentos fallidos desde esta dirección IP. Por motivos de seguridad, la cuenta y solicitudes han sido bloqueadas temporalmente durante 15 minutos.'
    }
});

// Limitador general para API (500 solicitudes cada 15 min por IP)
// Permite uso simultáneo fluido de 50+ usuarios sin riesgo de DoS
export const apiRateLimiter = rateLimit({
    windowMs: 15 * 60 * 1000,
    max: 1000,
    standardHeaders: true,
    legacyHeaders: false,
    message: {
        success: false,
        message: 'Límite de solicitudes superado. Por favor espera unos momentos antes de continuar.'
    }
});
