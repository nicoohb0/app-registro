import swaggerJsdoc from 'swagger-jsdoc';

const options = {
  definition: {
    openapi: '3.0.0',
    info: {
      title: 'API Sistema de Registro',
      version: '1.0.0',
      description: 'API para aplicación móvil de registro de usuarios',
      contact: {
        name: 'Departamento de Informática',
      },
    },
    servers: [
      {
        url: 'http://localhost:5566',
        description: 'Servidor de desarrollo',
      },
      {
        url: 'https://tu-dominio.com',
        description: 'Servidor de producción',
      },
    ],
    components: {
      securitySchemes: {
        bearerAuth: {
          type: 'http',
          scheme: 'bearer',
          bearerFormat: 'JWT',
        },
      },
      schemas: {
        User: {
          type: 'object',
          properties: {
            _id: { type: 'string', description: 'ID del usuario' },
            nombre: { type: 'string', maxLength: 15, description: 'Nombre del usuario' },
            apellido: { type: 'string', maxLength: 15, description: 'Apellido del usuario' },
            correo: { type: 'string', format: 'email', description: 'Correo electrónico' },
            fechaRegistro: { type: 'string', format: 'date-time' },
            ultimoAcceso: { type: 'string', format: 'date-time' },
          },
        },
        UserInput: {
          type: 'object',
          required: ['nombre', 'apellido', 'correo', 'clave'],
          properties: {
            nombre: { type: 'string', maxLength: 15, pattern: '^[A-Za-zÁÉÍÓÚáéíóúÑñ\\s]{1,15}$' },
            apellido: { type: 'string', maxLength: 15, pattern: '^[A-Za-zÁÉÍÓÚáéíóúÑñ\\s]{1,15}$' },
            correo: { type: 'string', format: 'email' },
            clave: { type: 'string', minLength: 12, description: 'Contraseña segura' },
          },
        },
        LoginInput: {
          type: 'object',
          required: ['correo', 'clave'],
          properties: {
            correo: { type: 'string', format: 'email' },
            clave: { type: 'string' },
          },
        },
        LoginResponse: {
          type: 'object',
          properties: {
            success: { type: 'boolean' },
            usuario: { $ref: '#/components/schemas/User' },
            token: { type: 'string', description: 'JWT token' },
          },
        },
        Error: {
          type: 'object',
          properties: {
            success: { type: 'boolean', default: false },
            error: { type: 'string' },
            tipo: { type: 'string' },
          },
        },
        PasswordValidation: {
          type: 'object',
          properties: {
            success: { type: 'boolean' },
            isValid: { type: 'boolean' },
            errors: { type: 'array', items: { type: 'string' } },
            isCommonPassword: { type: 'boolean' },
            strength: { type: 'string', enum: ['Débil', 'Moderada', 'Fuerte', 'Muy fuerte'] },
          },
        },
      },
    },
    tags: [
      { name: 'Autenticación', description: 'Endpoints de autenticación' },
      { name: 'Usuarios', description: 'Gestión de usuarios' },
      { name: 'Seguridad', description: 'Utilidades de seguridad' },
    ],
  },
  apis: ['./routes/*.js', './controller/*.js'],
};

export default swaggerJsdoc(options);