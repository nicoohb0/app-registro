# app-registro


```bash
npm install express
```
```bash
npm install express-handlebars
```
```bash
npm install body-parser
```
```bash
npm install dotenv
```
```bash
npm install --save-dev nodemon
```
```bash
npm install bcrypt
```
```bash
npm install bootstrap
```
```bash
npm install mongodb
```

API JSON

```bash
npm install swagger-ui-express swagger-jsdoc
```

```bash
npm install jsonwebtoken
```


extensión visualCode

--Thunder Client--




# REPORTE DE AUDITORÍA DE SEGURIDAD API REST

**Fecha:** 2026-03-03
**Auditor:** Nicolás
**Versión API:** 1.0.0
**Aplicación:** Sistema de Registro de Usuarios

## RESUMEN EJECUTIVO

Se realizó auditoría de seguridad siguiendo la OWASP Web Security Testing Guide (WSTG) v4.2 y OWASP API Security Top 10.

**Total pruebas realizadas:** 16
**Pruebas exitosas (PASS):** 14
**Pruebas fallidas (FAIL):** 2
**Porcentaje de cumplimiento:** 87.5%

## TABLA DE RESULTADOS

| ID Control (WSTG) | Descripción de la Prueba | Resultado | Observaciones/Mitigación |
|-------------------|--------------------------|-----------|--------------------------|
| **CONFIGURACIÓN** |
| WSTG-CONF-01 | Verificar cabeceras de seguridad HTTP | ✅ PASS | HSTS, CSP, X-Frame-Options, X-Content-Type-Options configurados correctamente |
| WSTG-CONF-05 | Enumeración de endpoints | ✅ PASS | No hay endpoints expuestos innecesariamente, solo `/api-docs` en desarrollo |
| **IDENTIFICACIÓN** |
| WSTG-IDNT-04 | Prueba de enumeración de cuentas | ✅ PASS | Mensajes genéricos en login ("Credenciales inválidas" sin especificar qué falló) |
| WSTG-IDNT-05 | Política de contraseñas débiles | ✅ PASS | Validación de 12+ caracteres con mayúsculas, minúsculas, números y especiales |
| **AUTENTICACIÓN** |
| WSTG-AUTH-02 | Bypass de autenticación | ✅ PASS | Middleware JWT implementado correctamente en todas las rutas protegidas |
| WSTG-AUTH-03 | Prueba de expiración de sesión | ⚠️ FAIL | Token JWT expira en 24h (debería ser máximo 1h para producción) |
| WSTG-AUTH-07 | Fallo de autenticación | ✅ PASS | Bloqueo después de 5 intentos fallidos implementado |
| **AUTORIZACIÓN** |
| WSTG-ATHZ-02 | IDOR (Insecure Direct Object References) | ✅ PASS | Validación de propiedad del recurso: usuario solo puede acceder a sus propios datos |
| WSTG-ATHZ-04 | Falta de autorización | ✅ PASS | Todas las rutas sensibles requieren token Bearer |
| **CRIPTOGRAFÍA** |
| WSTG-CRYP-01 | Transmisión de datos sensibles | ✅ PASS | Uso de bcrypt con salt rounds 12 para contraseñas |
| WSTG-CRYP-03 | Canales no encriptados | ✅ PASS | HTTPS configurado en producción con HSTS |
| **MANEJO DE ERRORES** |
| WSTG-ERR-01 | Fuga de información en errores | ✅ PASS | Mensajes genéricos sin stack traces, errores controlados |
| WSTG-ERR-02 | Manejo de excepciones | ✅ PASS | Try-catch en todas las operaciones con la base de datos |
| **API SECURITY TOP 10** |
| API1:2019 | Broken Object Level Authorization | ✅ PASS | Verificación de propiedad en endpoints GET, PUT, DELETE |
| API2:2019 | Broken User Authentication | ⚠️ FAIL | JWT con expiración larga (24h) - Riesgo si el token es robado |
| API3:2019 | Excessive Data Exposure | ✅ PASS | Proyección de campos en respuestas, no se expone hash de contraseña |
| API4:2019 | Lack of Resources & Rate Limiting | ✅ PASS | Bloqueo por intentos fallidos implementado |

## VULNERABILIDADES DETECTADAS

### 1. Token JWT con expiración prolongada (24h)
- **Riesgo:** Medio-Alto
- **Categoría OWASP:** API2:2019 - Broken User Authentication
- **Evidencia:** 
  ```javascript
  // En controller/registro.js
  jwt.sign({...}, process.env.JWT_SECRET, { expiresIn: '24h' })
  