# 🎓 UranusData Backend API

Sistema de gestión de equipos, préstamos y reservas para instituciones educativas.

## 📌 Descripción

**UranusData** es una API REST completamente desacoplada, agnóstica y reutilizable para cualquier cliente (Angular, React, Vue, mobile, etc.).

### Características
- ✅ API REST pura (JSON)
- ✅ Autenticación con Sanctum
- ✅ Control de roles y permisos
- ✅ Gestión de usuarios, equipos, préstamos y reservas
- ✅ Sistema de recuperación de contraseña
- ✅ Historial completo de transacciones
- ✅ Exportación de reportes
- ✅ CORS configurado
- ✅ Documentación completa
- ✅ Docker ready

---

## 🚀 Quick Start

### Sin Docker
```bash
# 1. Clonar y configurar
git clone <repo>
cd uranusdata-backend
cp .env.example .env
composer install

# 2. Configurar DB en .env y ejecutar migraciones
php artisan key:generate
php artisan migrate

# 3. Iniciar servidor
php artisan serve
```

### Con Docker
```bash
docker-compose up -d
docker-compose exec app php artisan migrate
```

**API disponible en:** `http://localhost:8000/api`

---

## 📚 Documentación

- [🔧 Instalación completa](./INSTALACION.md)
- [📋 API Reference](./API_DOCUMENTATION.md)
- [⚙️ Variables de configuración](./.env.example)

---

## 🔑 Endpoints Rápidos

| Método | Endpoint | Descripción |
|--------|----------|-------------|
| POST | `/api/login` | Iniciar sesión |
| POST | `/api/register` | Registrar usuario |
| POST | `/api/logout` | Cerrar sesión |
| GET | `/api/gestion/usuarios` | Listar usuarios |
| GET | `/api/gestion/usuarios/prestamos-activos` | Préstamos activos |
| GET | `/api/perfil/{doc}` | Obtener perfil |
| PUT | `/api/perfil/{doc}` | Actualizar perfil |

**[Ver documentación completa →](./API_DOCUMENTATION.md)**

---

## 🔐 Autenticación

Usa `Authorization: Bearer {token}` en headers de peticiones autenticadas.

```bash
curl http://localhost:8000/api/gestion/usuarios \
  -H "Authorization: Bearer eyJ..."
```

---

## 👥 Roles

- **Gerente (2)**: Gestión completa
- **Técnico (3)**: Gestión de inventario
- **Docente (1)**: Reservas personales

---

## 🛠️ Tecnología

- **Laravel 12**: Framework PHP
- **Sanctum**: Autenticación API
- **MySQL 8**: Base de datos
- **Docker**: Containerización

---

## 📁 Estructura

```bash
    laravel-backend/
    ├── app/Http/Controllers/ # Lógica API
    ├── app/Models/ # Datos
    ├── routes/api.php # Endpoints
    ├── config/ # Configuración
    ├── database/ # Migraciones
    ├── .env.example # Plantilla config
    ├── API_DOCUMENTATION.md # Documentación
    ├── INSTALACION.md # Guía instalación
    └── docker-compose.yml # Docker config    
```

---

## 🤝 Integración con Frontend

El backend está completamente desacoplado. Conecta fácilmente desde:

- **Angular** (ejemplo: `src/app/core/service/auth.service.ts`)
- **React** (con fetch/axios)
- **Vue** (con axios)
- **Aplicaciones móviles** (iOS/Android)

Solo necesitas el token Bearer y la URL base de la API.

---

## 📝 Licencia

Proyecto educativo - Santa Isabel de Hungría 2026

---

- Documentación: Ver `API_DOCUMENTATION.md`
- Issues: Crear en repositorio