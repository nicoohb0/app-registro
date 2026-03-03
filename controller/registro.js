import registroModel from '../model/registro.js';
import jwt from 'jsonwebtoken';

class registroController {
    // ========== NUEVO: Generar token JWT ==========
    generateToken(user) {
        return jwt.sign(
            { 
                id: user.id || user._id,
                correo: user.correo,
                nombre: user.nombre,
                apellido: user.apellido
            },
            process.env.JWT_SECRET,
            { expiresIn: process.env.JWT_EXPIRES_IN || '24h' }
        );
    }

    // ========== NUEVO: Middleware de verificación de token ==========
    verifyToken(req, res, next) {
        const authHeader = req.headers.authorization;
        
        if (!authHeader || !authHeader.startsWith('Bearer ')) {
            return res.status(401).json({
                success: false,
                error: 'Token no proporcionado'
            });
        }

        const token = authHeader.split(' ')[1];

        try {
            const decoded = jwt.verify(token, process.env.JWT_SECRET);
            req.user = decoded;
            next();
        } catch (error) {
            if (error.name === 'TokenExpiredError') {
                return res.status(401).json({
                    success: false,
                    error: 'Token expirado'
                });
            }
            return res.status(403).json({
                success: false,
                error: 'Token inválido'
            });
        }
    }

    calculatePasswordStrength(password) {
        let score = 0;

        if (password.length >= 12) score += 2;
        else if (password.length >= 8) score += 1;

        if (/[A-Z]/.test(password)) score += 1;
        if (/[a-z]/.test(password)) score += 1;
        if (/\d/.test(password)) score += 1;
        if (/[^A-Za-z0-9]/.test(password)) score += 1;

        if (score >= 6) return 'Muy fuerte';
        if (score >= 4) return 'Fuerte';
        if (score >= 2) return 'Moderada';
        return 'Débil';
    }

    async create(req, res) {
        try {
            const { nombre, apellido, correo, clave, recaptchaToken } = req.body;

            if (!nombre || !apellido || !correo || !clave) {
                return res.status(400).json({
                    success: false,
                    error: 'Datos incompletos. Todos los campos son requeridos.'
                });
            }

            // CAPTCHA - SOLO EN PRODUCCIÓN Y SI HAY TOKEN
            if (process.env.NODE_ENV === 'production' && recaptchaToken) {
                try {
                    const verificationUrl = 'https://www.google.com/recaptcha/api/siteverify';
                    const response = await fetch(verificationUrl, {
                        method: 'POST',
                        headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
                        body: `secret=${process.env.RECAPTCHA_SECRET_KEY || 'TU_SECRET_KEY'}&response=${recaptchaToken}`
                    });

                    const data = await response.json();

                    if (!data.success || data.score < 0.5) {
                        return res.status(400).json({
                            success: false,
                            error: 'Verificación CAPTCHA fallida'
                        });
                    }
                } catch (captchaError) {
                    console.error('Error en CAPTCHA:', captchaError);
                }
            }

            const result = await registroModel.create(req.body);

            if (result.acknowledged) {
                res.status(201).json({
                    success: true,
                    message: 'Usuario registrado exitosamente',
                    id: result.insertedId
                });
            } else {
                throw new Error('No se pudo crear el usuario');
            }

        } catch (e) {
            console.error('Error en create:', e.message);
            
            if (e.message && e.message.includes('común')) {
                return res.status(400).json({
                    success: false,
                    error: e.message,
                    tipo: 'CONTRASEÑA_COMUN'
                });
            }
            
            if (e.message && e.message.includes('Contraseña inválida')) {
                return res.status(400).json({
                    success: false,
                    error: e.message,
                    tipo: 'CONTRASEÑA_INVALIDA'
                });
            }
            
            if (e.message && e.message.includes('ya está registrado')) {
                return res.status(400).json({
                    success: false,
                    error: e.message,
                    tipo: 'CORREO_DUPLICADO'
                });
            }

            res.status(400).json({
                success: false,
                error: e.message || 'No se pudo completar el registro'
            });
        }
    }

    // ========== MODIFICADO: authenticate con JWT ==========
    async authenticate(req, res) {
        try {
            const { correo, clave } = req.body;

            if (!correo || !clave) {
                return res.status(400).json({
                    success: false,
                    error: 'Correo y contraseña son requeridos'
                });
            }

            const result = await registroModel.authenticate(correo, clave);

            if (result.success) {
                // Generar token JWT
                const token = this.generateToken(result.usuario);
                
                res.status(200).json({
                    success: true,
                    usuario: result.usuario,
                    token: token,
                    expiresIn: process.env.JWT_EXPIRES_IN
                });
            } else {
                const response = {
                    success: false,
                    error: result.reason || 'Credenciales inválidas'
                };

                if (result.intentosRestantes !== undefined) {
                    response.intentosRestantes = result.intentosRestantes;
                }

                res.status(401).json(response);
            }
        } catch (e) {
            console.error('Error en authenticate:', e);
            res.status(500).json({
                success: false,
                error: 'Error en el proceso de autenticación'
            });
        }
    }

    // ========== MODIFICADO: getAll con protección ==========
    async getAll(req, res) {
        try {
            const data = await registroModel.getAll();
            res.status(200).json({
                success: true,
                usuarios: data
            });
        } catch (e) {
            console.error('Error en getAll:', e);
            res.status(500).json({
                success: false,
                error: e.message
            });
        }
    }

    // ========== MODIFICADO: getOne con protección ==========
    async getOne(req, res) {
        try {
            const { id } = req.params;
            
            // Verificar que el usuario solo pueda acceder a sus propios datos
            if (req.user.id !== id && req.user.id !== id.toString()) {
                return res.status(403).json({
                    success: false,
                    error: 'No tienes permiso para acceder a este recurso'
                });
            }

            const data = await registroModel.getOne(id);

            if (!data) {
                return res.status(404).json({
                    success: false,
                    error: 'Usuario no encontrado'
                });
            }

            res.status(200).json({
                success: true,
                usuario: data
            });
        } catch (e) {
            console.error('Error en getOne:', e);
            res.status(500).json({
                success: false,
                error: e.message
            });
        }
    }

    async update(req, res) {
        try {
            const { id } = req.params;
            
            // Verificar que el usuario solo pueda actualizar sus propios datos
            if (req.user.id !== id && req.user.id !== id.toString()) {
                return res.status(403).json({
                    success: false,
                    error: 'No tienes permiso para modificar este recurso'
                });
            }

            const data = await registroModel.update(id, req.body);
            
            res.status(200).json({
                success: true,
                message: 'Usuario actualizado exitosamente',
                modifiedCount: data.modifiedCount
            });
        } catch (e) {
            console.error('Error en update:', e);
            
            if (e.message && e.message.includes('común')) {
                return res.status(400).json({
                    success: false,
                    error: e.message,
                    tipo: 'CONTRASEÑA_COMUN'
                });
            }
            
            res.status(400).json({
                success: false,
                error: e.message
            });
        }
    }

    async delete(req, res) {
        try {
            const { id } = req.params;
            
            // Verificar que el usuario solo pueda eliminar sus propios datos
            if (req.user.id !== id && req.user.id !== id.toString()) {
                return res.status(403).json({
                    success: false,
                    error: 'No tienes permiso para eliminar este recurso'
                });
            }

            const data = await registroModel.delete(id);
            
            res.status(200).json({
                success: true,
                message: 'Usuario eliminado exitosamente',
                deletedCount: data.deletedCount
            });
        } catch (e) {
            console.error('Error en delete:', e);
            res.status(500).json({
                success: false,
                error: e.message
            });
        }
    }

    async generateSecurePassword(req, res) {
        try {
            const securePassword = registroModel.generateSecurePassword();
            res.status(200).json({
                success: true,
                password: securePassword,
                message: 'Contraseña segura generada'
            });
        } catch (e) {
            console.error('Error en generateSecurePassword:', e);
            res.status(500).json({
                success: false,
                error: e.message
            });
        }
    }

    async validatePassword(req, res) {
        try {
            const { password } = req.body;

            if (!password) {
                return res.status(400).json({
                    success: false,
                    error: 'Contraseña requerida'
                });
            }

            const validation = await registroModel.validatePasswordStrength(password);

            res.status(200).json({
                success: validation.isValid,
                isValid: validation.isValid,
                errors: validation.errors,
                isCommonPassword: validation.isCommonPassword || false,
                strength: this.calculatePasswordStrength(password)
            });
        } catch (e) {
            console.error('Error en validatePassword:', e);
            res.status(500).json({
                success: false,
                error: e.message
            });
        }
    }

    async getCommonPasswords(req, res) {
        try {
            const commonPasswords = await registroModel.loadCommonPasswords();
            
            res.status(200).json({
                success: true,
                count: commonPasswords.length,
                passwords: commonPasswords.slice(0, 50),
                message: `Se cargaron ${commonPasswords.length} contraseñas comunes del archivo password.txt`
            });
        } catch (e) {
            console.error('Error en getCommonPasswords:', e);
            res.status(500).json({
                success: false,
                error: e.message
            });
        }
    }

    async checkCommonPassword(req, res) {
        try {
            const { password } = req.body;

            if (!password) {
                return res.status(400).json({
                    success: false,
                    error: 'Contraseña requerida'
                });
            }

            const commonCheck = await registroModel.validateAgainstCommonPasswords(password);
            
            res.status(200).json({
                success: true,
                isCommon: commonCheck.isCommon,
                message: commonCheck.isCommon 
                    ? '⚠️ ¡ALERTA! Esta contraseña está en la lista de contraseñas comunes y NO es segura' 
                    : '✅ Esta contraseña NO está en la lista de contraseñas comunes',
                recommendations: commonCheck.isCommon 
                    ? [
                        'Elige una contraseña más única',
                        'Usa una combinación de palabras poco común',
                        'Añade números y caracteres especiales',
                        'No uses palabras del diccionario'
                      ]
                    : [
                        'Tu contraseña parece ser única',
                        '¡Excelente trabajo eligiendo una contraseña segura!'
                      ]
            });
        } catch (e) {
            console.error('Error en checkCommonPassword:', e);
            res.status(500).json({
                success: false,
                error: e.message
            });
        }
    }
}

export default new registroController();