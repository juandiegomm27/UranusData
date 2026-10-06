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
Requiere token de un usuario con rol Gerente.
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
Busca el usuario por documento para iniciar la activación
```bash
curl -X POST http://localhost:8000/api/activar/validar \
  -H "Content-Type: application/json" \
  -d '{
    "documento": "1234567890"
  }'
```

#### POST /activar/cuenta
Activa la cuenta (solo si está Inactivo) y define la contraseña
```bash
curl -X POST http://localhost:8000/api/activar/cuenta \
  -H "Content-Type: application/json" \
  -d '{
    "documento": "1234567890",
    "password": "newpassword123",
    "confirmPassword": "newpassword123"
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

#### GET /gestion/usuario
Listar usuarios con paginación
```bash
curl "http://localhost:8000/api/gestion/usuario?page=1&per_page=10&busqueda=juan&rol=2" \
  -H "Authorization: Bearer {token}"
```

**Parámetros:**
- `page` (int): Página actual
- `per_page` (int): Registros por página (máx 100)
- `busqueda` (string): Búsqueda por documento/nombre/apellido
- `rol` (int): Filtrar por ID de rol
- `estado` (int): Filtrar por ID de estado

#### GET /gestion/usuario/{documento}
Obtener usuario específico
```bash
curl http://localhost:8000/api/gestion/usuario/1234567890 \
  -H "Authorization: Bearer {token}"
```

#### POST /gestion/usuario
Crear usuario
```bash
curl -X POST http://localhost:8000/api/gestion/usuario \
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

#### PUT /gestion/usuario/{documento}
Actualizar usuario
```bash
curl -X PUT http://localhost:8000/api/gestion/usuario/1234567890 \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer {token}" \
  -d '{
    "nombre": "Juan",
    "apellido": "Pérez",
    "cod_rol": 3,
    "cod_estado_usuario": 2
  }'
```

#### DELETE /gestion/usuario/{documento}
Eliminar usuario
```bash
curl -X DELETE http://localhost:8000/api/gestion/usuario/1234567890 \
  -H "Authorization: Bearer {token}"
```

#### GET /gestion/usuario/estados/list
Listar estados disponibles
```bash
curl http://localhost:8000/api/gestion/usuario/estados/list \
  -H "Authorization: Bearer {token}"
```

#### GET /gestion/usuario/rol/list
Listar roles disponibles
```bash
curl http://localhost:8000/api/gestion/usuario/rol/list \
  -H "Authorization: Bearer {token}"
```

---

###  PRÉSTAMOS ACTIVOS (Gerente/Técnico)

#### GET /gestion/usuario/prestamos-activos
Listar préstamos activos
```bash
curl "http://localhost:8000/api/gestion/usuario/prestamos-activos?page=1&per_page=10&busqueda=juan&estado=2&tipo=1" \
  -H "Authorization: Bearer {token}"
```

**Parámetros:**
- `page` (int): Página actual
- `per_page` (int): Registros por página
- `busqueda` (string): Búsqueda por documento/nombre/elemento
- `estado` (int): Filtrar por estado (1=Solicitado, 2=Entregado, 3=Devuelto, 4=Perdido, 5=Dañado)
- `tipo` (int): Filtrar por tipo de elemento

#### PUT /gestion/usuario/prestamos-activos/{id}
Actualizar estado de préstamo
```bash
curl -X PUT http://localhost:8000/api/gestion/usuario/prestamos-activos/15 \
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

#### GET /gestion/usuario/prestamos-activos/exportar
Exporta los préstamos activos en CSV (UTF-8 con BOM)
```bash
curl "http://localhost:8000/api/gestion/usuario/prestamos-activos/exportar" \
  -H "Authorization: Bearer {token}" \
  -o prestamos.csv
```

---

### 📦 INVENTARIO (Gerente/Técnico)

**Estados de elemento:** `1` Activo, `2` En préstamo, `3` Mantenimiento, `4` Baja.

| Método | Endpoint | Descripción |
|--------|----------|-------------|
| GET | `/inventario/opciones` | Tipos, marcas, ubicaciones, estados y tipos de mantenimiento |
| GET | `/inventario` | Lista paginada. Filtros: `search`, `tipo`, `marca`, `estado`, `ubicacion`, `principales`, `per_page`, `page`. No incluye bajas |
| GET | `/inventario/{id}` | Detalle con padre y componentes |
| POST | `/inventario` | Crea elemento (siempre nace Activo). Genera código si no se envía |
| PUT | `/inventario/{id}` | Edita datos (el estado NO se edita aquí) |
| GET | `/inventario/elementos-tipo/{tipo}` | Elementos por tipo |
| GET | `/inventario/exportar` | Exporta CSV |
| GET | `/inventario/{id}/historial` | Historial de mantenimientos del elemento |
| GET | `/inventario/{id}/movimientos` | Historial de movimientos (alta, edición, traslado, vínculo, baja, restauración) |
| POST | `/inventario/{id}/mantenimiento` | Envía a mantenimiento |
| PATCH | `/inventario/activos/{id}/dar-de-baja` | Baja de un equipo. Body: `motivo` (máx. 255) |
| POST | `/inventario/accesorios/{id_stock}/dar-de-baja` | Baja de unidades de un lote. Body: `cantidad`, `motivo` |
| GET | `/inventario/historial-bajas-general` | Historial paginado (15). Filtro `tipo=activo\|accesorio`. Incluye `resumen` con `registros` y `unidades` de todo el historial |
| POST | `/inventario/historial-bajas-general/{id}/restaurar` | Restaura una baja |

**Reglas:**
- Un equipo solo se envía a mantenimiento si está Activo.
- No se da de baja un equipo En préstamo ni en Mantenimiento.
- Un equipo con una reserva pendiente de entrega no puede enviarse a mantenimiento ni darse de baja (422 con el número de la reserva).
- Un elemento solo puede ser componente de un elemento principal que no sea componente de otro (un solo nivel). Al dar de baja el principal, sus componentes quedan independientes.
- `serial` y `cod_elemento` son únicos.

### 🔩 ACCESORIOS / STOCK POR LOTES (Gerente/Técnico)

| Método | Endpoint | Descripción |
|--------|----------|-------------|
| GET | `/inventario-accesorios` | Lista paginada con stock por ubicación. Filtros: `search`, `tipo`, `marca`, `ubicacion` |
| POST | `/inventario-accesorios` | Crea accesorio + stock inicial. Si se envía `id_accesorio`, suma stock al existente. El nombre no puede repetirse (422) |
| PUT | `/inventario-accesorios/{id}` | Edita datos globales (`nombre` máx. 100, `modelo`, `descripcion`, `cod_tipo_elemento`, `cod_marca`) |
| POST | `/inventario-accesorios/trasladar` | Traslada unidades entre ubicaciones. Body: `id_stock_origen`, `cod_ubi_destino`, `cantidad` |

### 🏷️ CATÁLOGOS (Gerente/Técnico)

| Método | Endpoint | Descripción |
|--------|----------|-------------|
| GET | `/marcas` | Lista de marcas |
| POST | `/marcas` | Crea marca (nombre único) |
| DELETE | `/marcas/{id}` | Elimina marca (400 si está en uso) |
| POST | `/tipos-elemento` | Crea tipo |
| PUT | `/tipos-elemento/{id}` | Edita tipo |
| DELETE | `/tipos-elemento/{id}` | Elimina tipo (400 si está en uso) |
| POST | `/ubicaciones` | Crea ubicación (si ya existe, la devuelve) |
| DELETE | `/ubicaciones/{id}` | Elimina ubicación (400 si tiene equipos o accesorios) |

### 🛠️ MANTENIMIENTO (Gerente/Técnico)

| Método | Endpoint | Descripción |
|--------|----------|-------------|
| GET | `/mantenimiento` | Lista paginada. Filtros: `busqueda`, `tipo`, `estado`, `fecha` |
| GET | `/mantenimiento/opciones` | Tipos y estados de mantenimiento |
| PUT | `/mantenimiento/{id}/completar` | Body: `observaciones`, `cod_estado_mantenimiento` (`2` pausa, `3` finalizado, `4` baja) |

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
| Docente | 1 | Ver perfil, catálogo y crear/consultar/editar sus reservas |
| Técnico | 2 | Inventario, mantenimiento, préstamos y reservas generales |
| Gerente | 3 | Todo lo del Técnico, más gestión de usuarios y registro (`/register`) |

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
GET /api/gestion/usuario
Authorization: Bearer {token_guardado}
```

---

## 🔧 Requisitos del Sistema

- PHP 8.2+
- Laravel 12
- MySQL 8.0+
- Composer 2.0+

