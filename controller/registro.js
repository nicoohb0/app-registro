import registroModel from '../model/registro.js';

class registroController {
    async create(req, res) {
        try {
            const { nombre, apellido, correo, clave } = req.body;

            if (!nombre || !apellido || !correo || !clave) {
                return res.status(400).json({
                    success: false,
                    error: 'Datos incompletos. Todos los campos son requeridos.'
                });
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
            res.status(400).json({
                success: false,
                error: e.message || 'No se pudo completar el registro'
            });
        }

        try {
            // Verificar CAPTCHA
            const { recaptchaToken } = req.body;

            if (!recaptchaToken) {
                return res.status(400).json({
                    success: false,
                    error: 'Verificación CAPTCHA requerida'
                });
            }

            const verificationUrl = 'https://www.google.com/recaptcha/api/siteverify';
            const response = await fetch(verificationUrl, {
                method: 'POST',
                headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
                body: `secret=TU_SECRET_KEY&response=${recaptchaToken}`
            });

            const data = await response.json();

            if (!data.success || data.score < 0.5) {
                return res.status(400).json({
                    success: false,
                    error: 'Verificación CAPTCHA fallida'
                });
            }
        } catch (error) {
        }
    }

    async authenticate(req, res) {
        try {
            const { correo, clave } = req.body;

            if (!correo || !clave) {
                return res.status(400).json({
                    success: false,
                    error: 'Datos requeridos'
                });
            }

            const result = await registroModel.authenticate(correo, clave);

            if (result.success) {
                res.status(200).json({
                    success: true,
                    usuario: result.usuario
                });
            } else {
                const response = {
                    success: false,
                    error: 'Credenciales inválidas'
                };

                if (result.intentosRestantes !== undefined) {
                    response.intentosRestantes = result.intentosRestantes;
                }

                res.status(401).json(response);
            }
        } catch (e) {
            res.status(500).json({
                success: false,
                error: 'Error en el proceso'
            });
        }
    }

    async getAll(req, res) {
        try {
            const data = await registroModel.getAll();
            res.status(200).json({
                success: true,
                usuarios: data
            });
        } catch (e) {
            res.status(500).json({
                success: false,
                error: e.message
            });
        }
    }

    async getOne(req, res) {
        try {
            const { id } = req.params;
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
            res.status(500).json({
                success: false,
                error: e.message
            });
        }
    }

    async update(req, res) {
        try {
            const { id } = req.params;
            const data = await registroModel.update(id, req.body);
            res.status(200).json({
                success: true,
                message: 'Usuario actualizado exitosamente',
                modifiedCount: data.modifiedCount
            });
        } catch (e) {
            res.status(400).json({
                success: false,
                error: e.message
            });
        }
    }

    async delete(req, res) {
        try {
            const { id } = req.params;
            const data = await registroModel.delete(id);
            res.status(200).json({
                success: true,
                message: 'Usuario eliminado exitosamente',
                deletedCount: data.deletedCount
            });
        } catch (e) {
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
                password: securePassword
            });
        } catch (e) {
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

            const validation = registroModel.validatePasswordStrength(password);

            res.status(200).json({
                success: validation.isValid,
                isValid: validation.isValid,
                errors: validation.errors,
                strength: this.calculatePasswordStrength(password)
            });
        } catch (e) {
            res.status(500).json({
                success: false,
                error: e.message
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
}

export default new registroController();