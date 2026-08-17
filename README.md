
## 🚀 Instalación

### Requisitos previos
- Node.js 18+
- PHP 8.2+
- MySQL 8.0+
- XAMPP (para desarrollo local)
- Composer

### Pasos

```bash
# 1. Clonar el repositorio
git clone <url-del-repositorio>
cd sana-uranus-data

# 2. Instalar dependencias del frontend
npm install

# 3. Configurar Laravel backend
cd laravel-backend
composer install
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

# 6. Crear carpeta de almacenamiento de sesiones
php artisan storage:link
```

### Configurar correos (SMTP)

En `laravel-backend/.env`:

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
# Terminal 1: Angular Frontend (puerto 4200)
npm start

# Terminal 2: Laravel Backend (puerto 3000)
cd laravel-backend
php artisan serve --port=3000
```

**Acceso a la aplicación:**
- Frontend: `http://localhost:4200`
- API Backend: `http://localhost:3000/api`

## 🔑 Roles y Funcionalidades

| Rol | Funcionalidades |
| --- | --- |
| **Docente** | Crear reservas, ver historial de préstamos, editar perfil |
| **Técnico** | Gestionar inventario, registrar mantenimientos, ver reservas |
| **Gerente** | Administrar usuarios, inventario, reservas, mantenimientos, generar reportes |

## 👤 Credenciales de Prueba

| Documento | Nombre | Rol | Contraseña |
| --- | --- | --- | --- |
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

---