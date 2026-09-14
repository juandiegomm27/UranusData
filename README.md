![Logo de UranusData](public/logo-largo-color.svg)

UranusData es una plataforma centralizada que permite digitalizar y automatizar los procesos de control de inventario. El sistema facilita la trazabilidad de los equipos registrados, gestionando su ciclo de vida a través de módulos especializados para reservas, préstamos y seguimiento de mantenimientos preventivos o correctivos. 

El proyecto está construido bajo una arquitectura separada:
- **Frontend:** Desarrollado con el framework Angular, encargado de la interfaz gráfica y la experiencia del usuario.
- **Backend:** Construido con Laravel (PHP), funciona como una API RESTful que procesa la lógica de negocio y gestiona la base de datos MySQL.

## 🚀 Instalación

### Requisitos previos
- [Node.js 26.8.1](https://nodejs.org/es/download/current)
- [Composer 2.10.2](https://getcomposer.org/download/)
- [PHP 8.2.12](https://www.php.net/downloads.php)
- [XAMPP ](https://www.apachefriends.org/es/index.html)

### Pasos

```bash
# 0. Clonar el repositorio
git clone <url-del-repositorio>
cd sana-uranus-data

# 1. Instalar dependencias del frontend
npm install

# 2. Instalación de Ngx-Charts para las gráficas del dashboard (Gerente/Técnico)
npm install @swimlane/ngx-charts --save

# 3. Configurar el backend Laravel
cd laravel-backend
composer install
# En Windows PowerShell usa: Copy-Item .env.example .env
cp .env.example .env
php artisan key:generate

# 4. Configurar base de datos en .env
DB_HOST=127.0.0.1
DB_PORT=3306
DB_DATABASE=UranusData
DB_USERNAME=root
DB_PASSWORD=

# 5. Crear tablas y cargar datos iniciales (tener encendido XAMPP con Apache y Mysql)
php artisan migrate
php artisan db:seed

# 6. Crear el enlace de almacenamiento público
php artisan storage:link

# 7. Volver a la raíz del proyecto
cd ..
```


### Configurar correos (opcional)

```bash
MAIL_MAILER=smtp
MAIL_HOST=smtp.gmail.com
MAIL_PORT=587
MAIL_USERNAME="tu_correo@gmail.com"
MAIL_PASSWORD="tu_contraseña_de_aplicacion"
MAIL_ENCRYPTION=tls
MAIL_FROM_ADDRESS="tu_correo@gmail.com"
MAIL_FROM_NAME="Soporte UranusData"
```

Envio de correo
```bash
cd .\laravel-backend\

php artisan config:clear

Mail::raw('Prueba exitosa', function($m) { $m->to('correo_destino@gmail.com')->subject('Prueba SMTP'); });
```

## ▶️ Ejecución

Encienda XAMPP con Apache y Mysql

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

| Rol | Funcionalidades principales |
| --- | --- |
| Docente | Crear, consultar y editar reservas |
| Técnico | Ver inventario, gestionar reservas y mantenimientos |
| Gerente | Gestión de usuarios, inventario y mantenimientos |

## 👤 Credenciales de Prueba

| Documento | Nombre | Rol | Contraseña |
| --- | --- | --- | --- |
| 1234567890 | Juan Diego Medina | Docente | 123456 |
| 1234567893 | Juan Camilo Aguirre | Técnico | 123456 |
| 1234567895 | Maria Garcia | Gerente | 123456 |

## 📧 Características

- ✅ Autenticación con hash Bcrypt
- ✅ Notificaciones por correo
- ✅ Modo claro/oscuro
- ✅ Gestión de sesiones
- ✅ API RESTful con Laravel
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

  