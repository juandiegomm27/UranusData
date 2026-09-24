![Logo de UranusData](./public/logo-largo-color.svg)
 
 # UranusData API - Documentación Completa

**Versión:** 1.0.0  
**Base URL:** `http://localhost:8000/api`  
**Autenticación:** Sanctum Bearer Token

---

## 🔐 Autenticación

Todos los endpoints excepto `login`, `register`, `activar/*` y `recuperar-contrasena/*` requieren:

Authorization: Bearer {token}


### Obtener Token
```bash
POST /api/login
Content-Type: application/json

{
  "documento": "1234567890",
  "password": "password123"
}
```

**Respuesta:**
```json
{
  "success": true,
  "usuario": {
    "documento": "1234567890",
    "nombre": "Juan",
    "apellido": "Pérez",
    "rol": "Gerente"
  },
  "token": "7|Vk1Yv8..."
}
```

---

##  Endpoints

### 🔑 AUTH - SIN AUTENTICACIÓN

#### POST /login
Iniciar sesión
```bash
curl -X POST http://localhost:8000/api/login \
  -H "Content-Type: application/json" \
  -d '{
    "documento": "1234567890",
    "password": "password"
  }'
```

#### POST /register
Registrar nuevo usuario
```bash
curl -X POST http://localhost:8000/api/register \
  -H "Content-Type: application/json" \
  -d '{
    "cod_rol": 3,
    "nombre": "Juan",
    "apellido": "Pérez",
    "documento": "1234567890",
    "correo": "juan@example.com",
    "password": "password123"
  }'
```

#### POST /activar/validar
Validar datos para activación
```bash
curl -X POST http://localhost:8000/api/activar/validar \
  -H "Content-Type: application/json" \
  -d '{
    "nombre": "Juan",
    "apellido": "Pérez",
    "documento": "1234567890",
    "correo": "juan@example.com",
    "cod_rol": 3
  }'
```

#### PUT /activar
Activar cuenta
```bash
curl -X PUT http://localhost:8000/api/activar \
  -H "Content-Type: application/json" \
  -d '{
    "nombre": "Juan",
    "apellido": "Pérez",
    "documento": "1234567890",
    "correo": "juan@example.com",
    "cod_rol": 3,
    "password": "newpassword123",
    "cod_estado_usuario": 2
  }'
```

#### POST /recuperar-contrasena/solicitar
Solicitar recuperación de contraseña
```bash
curl -X POST http://localhost:8000/api/recuperar-contrasena/solicitar \
  -H "Content-Type: application/json" \
  -d '{
    "documento": "1234567890",
    "correo": "juan@example.com"
  }'
```

#### GET /recuperar-contrasena/verificar/{token}
Verificar token de recuperación
```bash
curl http://localhost:8000/api/recuperar-contrasena/verificar/abc123def456
```

#### POST /recuperar-contrasena/confirmar
Confirmar nueva contraseña
```bash
curl -X POST http://localhost:8000/api/recuperar-contrasena/confirmar \
  -H "Content-Type: application/json" \
  -d '{
    "token": "abc123def456",
    "password": "newpassword123"
  }'
```

---

###  PERFIL - CON AUTENTICACIÓN

#### GET /perfil/{documento}
Obtener perfil de usuario
```bash
curl http://localhost:8000/api/perfil/1234567890 \
  -H "Authorization: Bearer {token}"
```

#### PUT /perfil/{documento}
Actualizar perfil
```bash
curl -X PUT http://localhost:8000/api/perfil/1234567890 \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer {token}" \
  -d '{
    "nombre": "Juan",
    "apellido": "Pérez",
    "correo": "juan@example.com",
    "telefono": "3001234567",
    "password": "newpassword123"
  }'
```

---

###  GESTIÓN DE USUARIOS (Gerente/Técnico)

#### GET /gestion/usuarios
Listar usuarios con paginación
```bash
curl "http://localhost:8000/api/gestion/usuarios?page=1&per_page=10&busqueda=juan&rol=2" \
  -H "Authorization: Bearer {token}"
```

**Parámetros:**
- `page` (int): Página actual
- `per_page` (int): Registros por página (máx 100)
- `busqueda` (string): Búsqueda por documento/nombre/apellido
- `rol` (int): Filtrar por ID de rol
- `estado` (int): Filtrar por ID de estado

#### GET /gestion/usuarios/{documento}
Obtener usuario específico
```bash
curl http://localhost:8000/api/gestion/usuarios/1234567890 \
  -H "Authorization: Bearer {token}"
```

#### POST /gestion/usuarios
Crear usuario
```bash
curl -X POST http://localhost:8000/api/gestion/usuarios \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer {token}" \
  -d '{
    "documento": "9876543210",
    "nombre": "Carlos",
    "apellido": "González",
    "correo": "carlos@example.com",
    "cod_rol": 3,
    "cod_estado_usuario": 2,
    "password": "password123"
  }'
```

#### PUT /gestion/usuarios/{documento}
Actualizar usuario
```bash
curl -X PUT http://localhost:8000/api/gestion/usuarios/1234567890 \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer {token}" \
  -d '{
    "nombre": "Juan",
    "apellido": "Pérez",
    "cod_rol": 3,
    "cod_estado_usuario": 2
  }'
```

#### DELETE /gestion/usuarios/{documento}
Eliminar usuario
```bash
curl -X DELETE http://localhost:8000/api/gestion/usuarios/1234567890 \
  -H "Authorization: Bearer {token}"
```

#### GET /gestion/usuarios/estados/list
Listar estados disponibles
```bash
curl http://localhost:8000/api/gestion/usuarios/estados/list \
  -H "Authorization: Bearer {token}"
```

#### GET /gestion/usuarios/roles/list
Listar roles disponibles
```bash
curl http://localhost:8000/api/gestion/usuarios/roles/list \
  -H "Authorization: Bearer {token}"
```

---

###  PRÉSTAMOS ACTIVOS (Gerente/Técnico)

#### GET /gestion/usuarios/prestamos-activos
Listar préstamos activos
```bash
curl "http://localhost:8000/api/gestion/usuarios/prestamos-activos?page=1&per_page=10&busqueda=juan&estado=2&tipo=1" \
  -H "Authorization: Bearer {token}"
```

**Parámetros:**
- `page` (int): Página actual
- `per_page` (int): Registros por página
- `busqueda` (string): Búsqueda por documento/nombre/elemento
- `estado` (int): Filtrar por estado (1=Solicitado, 2=Entregado, 3=Devuelto, 4=Perdido, 5=Dañado)
- `tipo` (int): Filtrar por tipo de elemento

#### PUT /gestion/usuarios/prestamos-activos/{id}
Actualizar estado de préstamo
```bash
curl -X PUT http://localhost:8000/api/gestion/usuarios/prestamos-activos/15 \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer {token}" \
  -d '{
    "cod_estado_prestamo": 2,
    "observaciones": "Entregado en buen estado"
  }'
```

**Estados válidos:**
- `1`: Solicitado
- `2`: Entregado
- `3`: Devuelto
- `4`: Perdido
- `5`: Dañado

#### GET /gestion/usuarios/prestamos-activos/exportar
Exportar préstamos
```bash
curl "http://localhost:8000/api/gestion/usuarios/prestamos-activos/exportar?formato=excel" \
  -H "Authorization: Bearer {token}" \
  -o prestamos.xlsx
```

---

## 🔄 Formatos de Respuesta

### Éxito (Listado con paginación)
```json
{
  "success": true,
  "mensaje": "Usuarios obtenidos correctamente",
  "data": [...],
  "pagination": {
    "total": 50,
    "per_page": 10,
    "current_page": 1,
    "last_page": 5,
    "from": 1,
    "to": 10
  },
  "timestamp": "2026-08-28T14:30:00Z"
}
```

### Éxito (Operación simple)
```json
{
  "success": true,
  "mensaje": "Operación exitosa",
  "data": {...},
  "timestamp": "2026-08-28T14:30:00Z"
}
```

### Error (Validación)
```json
{
  "success": false,
  "mensaje": "Validación fallida",
  "errors": {
    "documento": ["El documento es requerido"],
    "correo": ["El correo ya existe"]
  },
  "timestamp": "2026-08-28T14:30:00Z"
}
```

### Error (General)
```json
{
  "success": false,
  "mensaje": "Error al procesar solicitud",
  "timestamp": "2026-08-28T14:30:00Z"
}
```

---

## 🚀 Códigos de Estado HTTP

| Código | Significado |
|--------|-------------|
| 200 | Éxito |
| 201 | Creado |
| 400 | Solicitud inválida |
| 401 | No autenticado |
| 403 | No autorizado |
| 404 | No encontrado |
| 422 | Validación fallida |
| 500 | Error interno |

---

## 🛠️ Roles y Permisos

| Rol | ID | Permisos |
|-----|----|----|
| Gerente | 2 | Gestión completa de usuarios, préstamos, inventario |
| Técnico | 3 | Lectura/actualización de inventario y mantenimiento |
| Docente | 1 | Ver perfil, crear reservas personales |

---

##  Ejemplo de Integración (JavaScript/Angular)

```typescript
// 1. Login
POST /api/login
{
  "documento": "1234567890",
  "password": "password123"
}
→ Guardar token en localStorage

// 2. Usar token en siguientes peticiones
GET /api/gestion/usuarios
Authorization: Bearer {token_guardado}
```

---

## 🔧 Requisitos del Sistema

- PHP 8.2+
- Laravel 12
- MySQL 8.0+
- Composer 2.0+

