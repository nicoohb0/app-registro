import registroModel from '../model/registro.js';

class registroController {
    async create(req, res) {
        try {
            console.log('Datos recibidos:', req.body);
            
            if (!req.body.nombre || !req.body.correo || !req.body.clave) {
                return res.status(400).json({ 
                    success: false, 
                    error: 'Nombre, correo y contraseña son requeridos' 
                });
            }

            const data = await registroModel.create(req.body);
            
            res.status(201).json({ 
                success: true, 
                message: 'Usuario registrado exitosamente',
                insertedId: data.insertedId 
            });
        } catch (e) {
            console.error('Error en controlador create:', e);
            res.status(400).json({ 
                success: false, 
                error: e.message 
            });
        }
    }

    async authenticate(req, res) {
        try {
            console.log('Autenticando:', req.body);
            const { correo, clave } = req.body;
            
            if (!correo || !clave) {
                return res.status(400).json({ 
                    success: false, 
                    error: 'Correo y contraseña son requeridos' 
                });
            }

            const result = await registroModel.authenticate(correo, clave);
            
            if (result.success) {
                res.status(200).json({
                    success: true,
                    message: 'Autenticación exitosa',
                    usuario: result.usuario
                });
            } else {
                res.status(401).json({
                    success: false,
                    error: result.reason,
                    intentosRestantes: result.intentosRestantes
                });
            }
        } catch (e) {
            console.error('Error en controlador authenticate:', e);
            res.status(500).json({ 
                success: false, 
                error: 'Error en la autenticación' 
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
            console.error('Error en controlador getAll:', e);
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
            console.error('Error en controlador getOne:', e);
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
            console.error('Error en controlador update:', e);
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
            console.error('Error en controlador delete:', e);
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
            console.error('Error en controlador generateSecurePassword:', e);
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
            console.error('Error en controlador validatePassword:', e);
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