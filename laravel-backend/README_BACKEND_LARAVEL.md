![Logo de UranusData](../public/logo-largo-color.svg)

# 🎓 UranusData Backend API

## Guías de esta carpeta

- 🐳 [Instalación con Docker](./instalacion_docker.md) — MySQL y la API en contenedores
- 🐘 [Instalación con XAMPP](./instalacion_xampp.md) — instalar y depurar sin Docker

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

Con Apache y MySQL encendidos en XAMPP, desde **laravel-backend**:

```bash
composer install
```

```bash
Copy-Item .env.example .env; php artisan key:generate
```

```bash
php artisan migrate:fresh --seed
```

```bash
php artisan serve
```

Los pasos completos están en [instalacion_xampp.md](./instalacion_xampp.md).

### Con Docker

Desde la **raíz del proyecto**:

```bash
docker compose --profile legacy up -d mysql backend frontend
```

El contenedor instala Composer, genera el **APP_KEY**, migra y siembra él solo. Los
detalles están en [instalacion_docker.md](./instalacion_docker.md).

**API disponible en:** http://localhost:8000/api

---

## 📚 Documentación

- [🐳 Instalación con Docker](./instalacion_docker.md)
- [🐘 Instalación con XAMPP](./instalacion_xampp.md)
- [📋 Documentación de la API REST](../DOCUMENTATION.md)
- [⚙️ Variables de configuración](./.env.example)

---

## 🔑 Endpoints Rápidos

| Método | Endpoint | Descripción |
|--------|----------|-------------|
| POST | **/api/login** | Iniciar sesión |
| POST | **/api/register** | Registrar usuario |
| POST | **/api/logout** | Cerrar sesión |
| GET | **/api/gestion/usuario** | Listar usuarios |
| GET | **/api/gestion/usuario/prestamos-activos** | Préstamos activos |
| GET | **/api/perfil/{doc}** | Obtener perfil |
| PUT | **/api/perfil/{doc}** | Actualizar perfil |

**[Ver documentación completa →](../DOCUMENTATION.md)**


## 🔐 Autenticación

Usa **Authorization: Bearer {token}** en headers de peticiones autenticadas.

```bash
curl http://localhost:8000/api/gestion/usuario \
  -H "Authorization: Bearer eyJ..."
```


## 👥 Roles

- **Docente (1)**: Reservas personales
- **Técnico (2)**: Gestión de inventario, mantenimiento y préstamos
- **Gerente (3)**: Gestión completa


## 🛠️ Tecnología

- **Laravel 12**: Framework PHP
- **Sanctum**: Autenticación API
- **MySQL 8**: Base de datos
- **Docker**: Containerización

---

## 📁 Estructura

```bash
    laravel-backend/
    ├── app/Http/Controllers/     # Lógica API
    ├── app/Models/               # Datos
    ├── routes/api.php            # Endpoints
    ├── config/                   # Configuración
    ├── database/                 # Migraciones y seeders
    ├── .env.example              # Plantilla de configuración
    ├── Dockerfile                # Imagen del contenedor
    ├── entrypoint.sh             # Arranque: composer, key, migrate y seed
    ├── instalacion_docker.md     # Guía con Docker
    ├── instalacion_xampp.md      # Guía con XAMPP
    └── README_BACKEND_LARAVEL.md # Este archivo
```

El **docker-compose.yml** vive en la raíz del proyecto y cubre los tres stacks.


## 🤝 Integración con Frontend

El backend está completamente desacoplado. Conecta fácilmente desde:

- **Angular** (ejemplo: **../src/app/core/service/auth.service.ts**)
- **React** (con fetch/axios)
- **Vue** (con axios)
- **Aplicaciones móviles** (iOS/Android)

Solo necesitas el token Bearer y la URL base de la API.


## 📝 Licencia

Proyecto educativo - Santa Isabel de Hungría 2026

---

- Documentación de la API: [../DOCUMENTATION.md](../DOCUMENTATION.md)
- Issues: crear en el repositorio