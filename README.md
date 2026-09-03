
## 🚀 Instalación

### Requisitos previos
- Node.js 22.22.3 o superior compatible con Angular 22
- PHP 8.2+
- MySQL 8.0+
- Composer 2+
- XAMPP es opcional si ya tienes PHP y MySQL disponibles

### Pasos

```bash
# 1. Clonar el repositorio
git clone <url-del-repositorio>
cd sana-uranus-data

# 2. Instalar dependencias del frontend
npm install

# 3. Configurar el backend Laravel
cd laravel-backend
composer install
# En Windows PowerShell usa: Copy-Item .env.example .env
cp .env.example .env
php artisan key:generate

# 4. Configurar base de datos en .env
# DB_HOST=127.0.0.1
# DB_PORT=3306
# DB_DATABASE=UranusData
# DB_USERNAME=root
# DB_PASSWORD=

# 5. Crear tablas y cargar datos iniciales
php artisan migrate
php artisan db:seed

# 6. Crear el enlace de almacenamiento público
php artisan storage:link

# 7. Volver a la raíz del proyecto
cd ..
```

La plantilla `laravel-backend/.env.example` está preparada para desarrollo local:
usa MySQL en `127.0.0.1:3306`, frontend en `http://localhost:4200` y API en
`http://localhost:8000`. Después de copiarla a `.env`, ajusta únicamente los datos de
la base de datos si tu instalación es diferente. `APP_KEY` se genera con
`php artisan key:generate` y no debe compartirse.

La plantilla usa `SESSION_DRIVER=database`, `CACHE_STORE=database` y
`QUEUE_CONNECTION=database`; por eso debes ejecutar `php artisan migrate` antes de iniciar
la aplicación. Redis y AWS son opcionales y pueden permanecer sin configurar.

### Configurar correos

Para desarrollo, la plantilla usa `MAIL_MAILER=log`; los mensajes quedan registrados en
`laravel-backend/storage/logs/laravel.log`. Para enviar correos reales, cambia estas variables
en `laravel-backend/.env`:

```bash
MAIL_MAILER=smtp
MAIL_HOST=smtp.gmail.com
MAIL_PORT=587
MAIL_USERNAME=tu_correo@gmail.com
MAIL_PASSWORD=tu_contraseña_de_aplicacion
MAIL_ENCRYPTION=tls
MAIL_FROM_ADDRESS=tu_correo@gmail.com
```

## ▶️ Ejecución

```bash
# Desde la raíz del proyecto: inicia Angular y Laravel juntos
npm start
```

**Acceso a la aplicación:**
- Frontend: `http://localhost:4200`
- API Backend: `http://localhost:8000/api`

Para iniciarlos por separado:

```bash
# Terminal 1, desde la raíz
npm run start:frontend

# Terminal 2, desde la raíz
npm run start:backend
```

## 🔑 Roles y Funcionalidades

| Rol | Funcionalidades |
|    |    |
| **Docente** | Crear reservas, ver historial de préstamos, editar perfil |
| **Técnico** | Gestionar inventario, registrar mantenimiento, ver reservas |
| **Gerente** | Administrar usuarios, inventario, reservas, mantenimiento, generar reportes |

## 👤 Credenciales de Prueba

| Documento | Nombre | Rol | Contraseña |
|    |    |    |    |
| 1234567890 | Juan Diego Medina | Docente | 123456 |
| 1234567893 | Juan Camilo Aguirre | Técnico | 123456 |
| 1234567895 | Maria Garcia | Gerente | 123456 |

## 📧 Características

- ✅ Autenticación con hash Bcrypt
- ✅ Sistema de perfiles de usuario (Gravatar)
- ✅ Notificaciones por correo
- ✅ Modo claro/oscuro
- ✅ Respuestas adaptativas (mobile-first)
- ✅ Gestión de sesiones
- ✅ API RESTful con Laravel
- ✅ Paginación en tablas
- ✅ Filtrado y búsqueda avanzada
- ✅ Edición de perfiles con validación

## 🔐 Seguridad

- Contraseñas hasheadas con Bcrypt
- Guards de autenticación en rutas
- Validación CSRF en formularios
- CORS configurado
- Validación en servidor y cliente

## 👥 Autores

- Juan Diego Medina Mahecha
- Sofia Avila Martinez
- Juan David Bernal Torres
- Juan Camilo Aguirre Rojas

## 📄 Licencia

Proyecto académico para SENA - Sistema Integrado de Gestión

  