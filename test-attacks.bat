@echo off
echo ========================================
echo TESTEANDO MODSECURITY EN PUERTO 8080
echo ========================================
echo.

:: Prueba 1: SQL Injection (debe ser bloqueado - Status 403)
echo 1. Probando SQL Injection...
curl -X POST http://localhost:8080/api/registro/authenticate ^
  -H "Content-Type: application/json" ^
  -d "{\"correo\":\"' OR '1'='1\",\"clave\":\"test\"}" ^
  -w "  Status: %%{http_code}\n"

:: Prueba 2: Path Traversal (debe ser bloqueado)
echo.
echo 2. Probando Path Traversal...
curl http://localhost:8080/../../../etc/passwd -w "  Status: %%{http_code}\n"

:: Prueba 3: Registro normal (debe funcionar - Status 200/201)
echo.
echo 3. Probando registro normal...
curl -X POST http://localhost:8080/api/registro ^
  -H "Content-Type: application/json" ^
  -d "{\"nombre\":\"Juan\",\"apellido\":\"Perez\",\"correo\":\"juan@test.com\",\"clave\":\"P@ssw0rd_2026#\"}" ^
  -w "  Status: %%{http_code}\n"

:: Prueba 4: XSS (debe ser bloqueado)
echo.
echo 4. Probando XSS...
curl -X POST http://localhost:8080/api/registro ^
  -H "Content-Type: application/json" ^
  -d "{\"nombre\":\"<script>alert(1)</script>\",\"apellido\":\"Test\",\"correo\":\"test@test.com\",\"clave\":\"Test123!\"}" ^
  -w "  Status: %%{http_code}\n"

pause