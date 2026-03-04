import express from 'express';
const route = express.Router();
import registroController from '../controller/registro.js';

/**
 * @swagger
 * /api/registro:
 *   post:
 *     summary: Registrar un nuevo usuario
 *     tags: [Usuarios]
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             $ref: '#/components/schemas/UserInput'
 *     responses:
 *       201:
 *         description: Usuario registrado exitosamente
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 success:
 *                   type: boolean
 *                 message:
 *                   type: string
 *                 id:
 *                   type: string
 *       400:
 *         description: Error en la solicitud
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Error'
 */
route.post('/', registroController.create);

/**
 * @swagger
 * /api/registro/authenticate:
 *   post:
 *     summary: Autenticar usuario y obtener token JWT
 *     tags: [Autenticación]
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             $ref: '#/components/schemas/LoginInput'
 *     responses:
 *       200:
 *         description: Autenticación exitosa
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/LoginResponse'
 *       401:
 *         description: Credenciales inválidas
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Error'
 */
route.post('/authenticate', registroController.authenticate);

/**
 * @swagger
 * /api/registro/validate-password:
 *   post:
 *     summary: Validar fortaleza de una contraseña
 *     tags: [Seguridad]
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               password:
 *                 type: string
 *     responses:
 *       200:
 *         description: Resultado de la validación
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/PasswordValidation'
 */
route.post('/validate-password', registroController.validatePassword);

/**
 * @swagger
 * /api/registro/generate-password:
 *   get:
 *     summary: Generar una contraseña segura aleatoria
 *     tags: [Seguridad]
 *     responses:
 *       200:
 *         description: Contraseña generada
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 success:
 *                   type: boolean
 *                 password:
 *                   type: string
 */
route.get('/generate-password', registroController.generateSecurePassword);

/**
 * @swagger
 * /api/registro/common-passwords:
 *   get:
 *     summary: Obtener lista de contraseñas comunes (para referencia)
 *     tags: [Seguridad]
 *     responses:
 *       200:
 *         description: Lista de contraseñas comunes
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 success:
 *                   type: boolean
 *                 count:
 *                   type: integer
 *                 passwords:
 *                   type: array
 *                   items:
 *                     type: string
 */
route.get('/common-passwords', registroController.getCommonPasswords);

/**
 * @swagger
 * /api/registro/check-common-password:
 *   post:
 *     summary: Verificar si una contraseña es común
 *     tags: [Seguridad]
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               password:
 *                 type: string
 *     responses:
 *       200:
 *         description: Resultado de la verificación
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 success:
 *                   type: boolean
 *                 isCommon:
 *                   type: boolean
 *                 message:
 *                   type: string
 */
route.post('/check-common-password', registroController.checkCommonPassword);

/**
 * @swagger
 * /api/registro:
 *   get:
 *     summary: Obtener todos los usuarios (requiere autenticación)
 *     tags: [Usuarios]
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: Lista de usuarios
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 success:
 *                   type: boolean
 *                 usuarios:
 *                   type: array
 *                   items:
 *                     $ref: '#/components/schemas/User'
 *       401:
 *         description: No autorizado
 */
route.get('/', registroController.verifyToken, registroController.getAll);

/**
 * @swagger
 * /api/registro/{id}:
 *   get:
 *     summary: Obtener un usuario por ID (requiere autenticación)
 *     tags: [Usuarios]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *         description: ID del usuario
 *     responses:
 *       200:
 *         description: Usuario encontrado
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 success:
 *                   type: boolean
 *                 usuario:
 *                   $ref: '#/components/schemas/User'
 *       404:
 *         description: Usuario no encontrado
 */
route.get('/:id', registroController.verifyToken, registroController.getOne);

/**
 * @swagger
 * /api/registro/{id}:
 *   put:
 *     summary: Actualizar un usuario (requiere autenticación)
 *     tags: [Usuarios]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *     requestBody:
 *       content:
 *         application/json:
 *           schema:
 *             $ref: '#/components/schemas/UserInput'
 *     responses:
 *       200:
 *         description: Usuario actualizado
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 success:
 *                   type: boolean
 *                 message:
 *                   type: string
 *                 modifiedCount:
 *                   type: integer
 */
route.put('/:id', registroController.verifyToken, registroController.update);

/**
 * @swagger
 * /api/registro/{id}:
 *   delete:
 *     summary: Eliminar un usuario (requiere autenticación)
 *     tags: [Usuarios]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *     responses:
 *       200:
 *         description: Usuario eliminado
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 success:
 *                   type: boolean
 *                 message:
 *                   type: string
 *                 deletedCount:
 *                   type: integer
 */
route.delete('/:id', registroController.verifyToken, registroController.delete);

export default route;