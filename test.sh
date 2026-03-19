#!/bin/bash

# Colores para output
GREEN='\033[0;32m'
BLUE='\033[0;34m'
RED='\033[0;31m'
NC='\033[0m' # No Color

echo -e "${BLUE}=== SISTEMA DE REGISTRO - API TEST ===${NC}\n"

# 1. Registrar usuario
echo -e "${GREEN}1. Registrando usuario...${NC}"
REGISTRO_RESPONSE=$(curl -s -X POST http://localhost:5566/api/registro \
  -H "Content-Type: application/json" \
  -d '{
    "nombre": "Franci",
    "apellido": "Baena",
    "correo": "franci@gmail.com",
    "clave": "xd1%,E8X7k9!Lm*G"
  }')

echo "Respuesta registro: $REGISTRO_RESPONSE"
USER_ID=$(echo $REGISTRO_RESPONSE | grep -o '"id":"[^"]*' | cut -d'"' -f4)

# 2. Autenticar usuario
echo -e "\n${GREEN}2. Autenticando usuario...${NC}"
AUTH_RESPONSE=$(curl -s -X POST http://localhost:5566/api/registro/authenticate \
  -H "Content-Type: application/json" \
  -d '{
    "correo": "franci@gmail.com",
    "clave": "xd1%,E8X7k9!Lm*G"
  }')

echo "Respuesta autenticación: $AUTH_RESPONSE"
TOKEN=$(echo $AUTH_RESPONSE | grep -o '"token":"[^"]*' | cut -d'"' -f4)

if [ -z "$TOKEN" ]; then
  echo -e "${RED}❌ No se pudo obtener el token${NC}"
  exit 1
fi

echo -e "${GREEN}✅ Token obtenido correctamente${NC}"

# 3. Obtener usuario por ID (con token)
echo -e "\n${GREEN}3. Obteniendo usuario por ID (con token)...${NC}"
curl -X GET "http://localhost:5566/api/registro/$USER_ID" \
  -H "accept: application/json" \
  -H "Authorization: Bearer $TOKEN" \
  -w "\n"

echo -e "\n${BLUE}=== PRUEBA COMPLETADA ===${NC}"
echo -e "${GREEN}✅ Si ves los datos del usuario, todo funciona correctamente${NC}"
echo -e "${YELLOW}⚠️  Si ves error de token, verifica que el token sea válido${NC}"