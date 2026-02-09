import { ObjectId } from "mongodb";
import dbcliente from "../config/dbcliente.js";
import bcrypt from 'bcrypt';
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

class registroModelo {
    static SALT_ROUNDS = 12;

    static PASSWORD_POLICY = {
        minLength: 12,
        maxLength: 128,
        requireUppercase: true,
        requireLowercase: true,
        requireNumbers: true,
        requireSpecialChars: true,
        specialChars: '!@#$%^&*()_+-=[]{}|;:,.<>?',
        allowSpaces: false
    };

    // ========== NUEVA FUNCIÓN: Cargar contraseñas comunes desde archivo ==========
    static async loadCommonPasswords() {
        try {
            const __filename = fileURLToPath(import.meta.url);
            const __dirname = path.dirname(__filename);
            const projectRoot = path.join(__dirname, '../..');
            const filePath = path.join(projectRoot, 'password.txt');
            
            console.log(`📁 Buscando archivo en: ${filePath}`);
            
            if (!fs.existsSync(filePath)) {
                console.warn('⚠️ Archivo password.txt no encontrado');
                return [];
            }
            
            const data = fs.readFileSync(filePath, 'utf8');
            const passwords = data
                .split('\n')
                .map(p => p.trim())
                .filter(p => p.length > 0);
            
            console.log(`📊 Cargadas ${passwords.length} contraseñas comunes desde password.txt`);
            return passwords;
        } catch (error) {
            console.error('❌ Error cargando contraseñas comunes:', error.message);
            return [];
        }
    }

    // ========== NUEVA FUNCIÓN: Validar contra contraseñas comunes ==========
    static async validateAgainstCommonPasswords(password) {
        const commonPasswords = await this.loadCommonPasswords();
        
        // Verificar si la contraseña está en la lista
        const isCommon = commonPasswords.some(commonPass => 
            password.toLowerCase().includes(commonPass.toLowerCase()) ||
            commonPass.toLowerCase().includes(password.toLowerCase())
        );
        
        // Verificar variaciones comunes
        const variations = [
            password,
            password + '123',
            password + '!',
            '123' + password,
            password + '2024',
            password + '2023',
            password.toLowerCase(),
            password.toUpperCase()
        ];
        
        const hasCommonVariation = variations.some(variation =>
            commonPasswords.some(commonPass =>
                commonPass.toLowerCase() === variation.toLowerCase()
            )
        );
        
        return {
            isCommon: isCommon || hasCommonVariation,
            commonPasswords: commonPasswords
        };
    }

    // ========== FUNCIÓN ACTUALIZADA: Validar fortaleza con chequeo de archivo ==========
    static async validatePasswordStrength(password) {
        const policy = this.PASSWORD_POLICY;
        const errors = [];

        if (password.length < policy.minLength) {
            errors.push(`La contraseña debe tener al menos ${policy.minLength} caracteres`);
        }
        if (password.length > policy.maxLength) {
            errors.push(`La contraseña no debe exceder ${policy.maxLength} caracteres`);
        }

        if (policy.requireUppercase && !/[A-Z]/.test(password)) {
            errors.push('La contraseña debe contener al menos una letra mayúscula');
        }
        if (policy.requireLowercase && !/[a-z]/.test(password)) {
            errors.push('La contraseña debe contener al menos una letra minúscula');
        }
        if (policy.requireNumbers && !/\d/.test(password)) {
            errors.push('La contraseña debe contener al menos un número');
        }
        if (policy.requireSpecialChars) {
            const specialRegex = new RegExp(`[${policy.specialChars.replace(/[.*+?^${}()|[\]\\]/g, '\\$&')}]`);
            if (!specialRegex.test(password)) {
                errors.push(`La contraseña debe contener al menos un carácter especial (${policy.specialChars})`);
            }
        }

        if (!policy.allowSpaces && /\s/.test(password)) {
            errors.push('La contraseña no debe contener espacios');
        }

        if (/^\d+$/.test(password)) {
            errors.push('La contraseña no puede contener solo números');
        }

        // ========== NUEVA VALIDACIÓN: Chequear contra archivo ==========
        const commonPasswordCheck = await this.validateAgainstCommonPasswords(password);
        if (commonPasswordCheck.isCommon) {
            errors.push('Esta contraseña es demasiado común. Por seguridad, elige una más única.');
        }

        return {
            isValid: errors.length === 0,
            errors: errors,
            isCommonPassword: commonPasswordCheck.isCommon
        };
    }

    static async hashPassword(password) {
        try {
            const salt = await bcrypt.genSalt(this.SALT_ROUNDS);
            const hashedPassword = await bcrypt.hash(password, salt);
            return hashedPassword;
        } catch (error) {
            console.error('Error en hashPassword:', error);
            throw new Error('Error al hashear la contraseña');
        }
    }

    static async verifyPassword(password, hashedPassword) {
        try {
            return await bcrypt.compare(password, hashedPassword);
        } catch (error) {
            console.error('Error en verifyPassword:', error);
            throw new Error('Error al verificar la contraseña');
        }
    }

    static generateSecurePassword() {
        const chars = {
            lower: 'abcdefghijklmnopqrstuvwxyz',
            upper: 'ABCDEFGHIJKLMNOPQRSTUVWXYZ',
            numbers: '0123456789',
            special: '!@#$%^&*()_+-=[]{}|;:,.<>?'
        };

        let password = [
            chars.lower[Math.floor(Math.random() * chars.lower.length)],
            chars.upper[Math.floor(Math.random() * chars.upper.length)],
            chars.numbers[Math.floor(Math.random() * chars.numbers.length)],
            chars.special[Math.floor(Math.random() * chars.special.length)]
        ];

        const allChars = chars.lower + chars.upper + chars.numbers + chars.special;
        for (let i = password.length; i < 12; i++) {
            password.push(allChars[Math.floor(Math.random() * allChars.length)]);
        }

        password = password.sort(() => Math.random() - 0.5).join('');

        return password;
    }

    async create(registroData) {
        try {
            const colRegistro = dbcliente.db.collection('registro');
            const nombreValidation = this.validarNombreApellidoTexto(registroData.nombre);
            const apellidoValidation = this.validarNombreApellidoTexto(registroData.apellido);

            if (!dbcliente.db) {
                await dbcliente.conectarDB();
            }

            if (!nombreValidation.isValid) {
                throw new Error(`Nombre inválido: ${nombreValidation.error}`);
            }

            if (!apellidoValidation.isValid) {
                throw new Error(`Apellido inválido: ${apellidoValidation.error}`);
            }

            const passwordValidation = await registroModelo.validatePasswordStrength(registroData.clave);
            if (!passwordValidation.isValid) {
                throw new Error(`Contraseña inválida: ${passwordValidation.errors.join(', ')}`);
            }

            const existingUser = await colRegistro.findOne({ correo: registroData.correo });
            if (existingUser) {
                throw new Error('El correo electrónico ya está registrado');
            }

            const hashedPassword = await registroModelo.hashPassword(registroData.clave);
            const registro = {
                nombre: registroData.nombre,
                apellido: registroData.apellido,
                correo: registroData.correo,
                claveHash: hashedPassword,
                fechaRegistro: new Date().toISOString(),
                ultimoAcceso: null,
                intentosFallidos: 0,
                bloqueado: false,
                historicoClaves: [hashedPassword],
                datosSeguridad: {
                    saltRounds: registroModelo.SALT_ROUNDS,
                    ultimaActualizacionClave: new Date().toISOString()
                }
            };

            console.log('📝 Datos recibidos en modelo:', registroData);

            if (!dbcliente.db) {
                console.log('🔗 Conectando a DB...');
                await dbcliente.conectarDB();
            }

            return await colRegistro.insertOne(registro);
        } catch (error) {
            console.error('❌ Error en modelo create:', error.message);
            throw error;
        }
    }

    validarNombreApellidoTexto(texto) {
        const regex = /^[A-Za-zÁÉÍÓÚáéíóúÑñ\s]{1,15}$/;

        if (!texto || texto.trim() === '') {
            return { isValid: false, error: 'Campo requerido' };
        }

        if (texto.length > 15) {
            return { isValid: false, error: 'Máximo 15 caracteres' };
        }

        if (!regex.test(texto)) {
            return {
                isValid: false,
                error: 'Solo se permiten letras (con o sin acentos) y espacios'
            };
        }

        return { isValid: true };
    }

    async update(id, registroData) {
        try {
            const colRegistro = dbcliente.db.collection('registro');

            if (registroData.clave) {
                const passwordValidation = await registroModelo.validatePasswordStrength(registroData.clave);
                if (!passwordValidation.isValid) {
                    throw new Error(`Contraseña inválida: ${passwordValidation.errors.join(', ')}`);
                }

                const hashedPassword = await registroModelo.hashPassword(registroData.clave);
                const usuarioActual = await colRegistro.findOne({ _id: new ObjectId(id) });

                for (const oldHash of usuarioActual.historicoClaves || []) {
                    if (await registroModelo.verifyPassword(registroData.clave, oldHash)) {
                        throw new Error('No puedes reutilizar una contraseña anterior');
                    }
                }

                registroData.claveHash = hashedPassword;
                registroData.datosSeguridad = {
                    ...usuarioActual.datosSeguridad,
                    ultimaActualizacionClave: new Date().toISOString()
                };

                registroData.historicoClaves = [
                    hashedPassword,
                    ...(usuarioActual.historicoClaves || []).slice(0, 4)
                ];

                delete registroData.clave;
            }

            return await colRegistro.updateOne(
                { _id: new ObjectId(id) },
                { $set: registroData }
            );
        } catch (error) {
            console.error('Error en modelo update:', error);
            throw error;
        }
    }

    async authenticate(email, password) {
        try {
            const colRegistro = dbcliente.db.collection('registro');
            const usuario = await colRegistro.findOne({ correo: email });

            if (!usuario) {
                await bcrypt.compare(password, '$2b$12$fakehashforsecurity');
                return { success: false, reason: 'Usuario no encontrado' };
            }

            if (usuario.bloqueado) {
                return {
                    success: false,
                    reason: 'Cuenta bloqueada. Contacta al administrador.'
                };
            }

            const passwordMatch = await registroModelo.verifyPassword(password, usuario.claveHash);

            if (!passwordMatch) {
                const intentosActualizados = (usuario.intentosFallidos || 0) + 1;
                await colRegistro.updateOne(
                    { _id: usuario._id },
                    {
                        $set: {
                            intentosFallidos: intentosActualizados,
                            bloqueado: intentosActualizados >= 5
                        }
                    }
                );

                return {
                    success: false,
                    reason: 'Contraseña incorrecta',
                    intentosRestantes: Math.max(0, 5 - intentosActualizados)
                };
            }

            await colRegistro.updateOne(
                { _id: usuario._id },
                {
                    $set: {
                        intentosFallidos: 0,
                        ultimoAcceso: new Date().toISOString()
                    }
                }
            );

            return {
                success: true,
                usuario: {
                    id: usuario._id,
                    nombre: usuario.nombre,
                    apellido: usuario.apellido,
                    correo: usuario.correo,
                    ultimoAcceso: new Date().toISOString()
                }
            };
        } catch (error) {
            throw new Error('Error en la autenticación');
        }
    }

    async delete(id) {
        try {
            const colRegistro = dbcliente.db.collection('registro');
            return await colRegistro.deleteOne({ _id: new ObjectId(id) });
        } catch (error) {
            console.error('Error en modelo delete:', error);
            throw error;
        }
    }

    async getAll() {
        try {
            const colRegistro = dbcliente.db.collection('registro');
            return await colRegistro.find({}, {
                projection: { claveHash: 0, historicoClaves: 0, datosSeguridad: 0 }
            }).toArray();
        } catch (error) {
            console.error('Error en modelo getAll:', error);
            throw error;
        }
    }

    async getOne(id) {
        try {
            const colRegistro = dbcliente.db.collection('registro');
            return await colRegistro.findOne(
                { _id: new ObjectId(id) },
                { projection: { claveHash: 0, historicoClaves: 0, datosSeguridad: 0 } }
            );
        } catch (error) {
            console.error('Error en modelo getOne:', error);
            throw error;
        }
    }
}

export default new registroModelo();