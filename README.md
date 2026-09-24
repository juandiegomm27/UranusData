![Logo de UranusData](public/logo-largo-color.svg)


UranusData es una plataforma centralizada que permite digitalizar y automatizar los procesos de control de inventario. El sistema facilita la trazabilidad de los equipos registrados, gestionando su ciclo de vida a través de módulos especializados para reservas, préstamos y seguimiento de mantenimientos preventivos o correctivos. 

El proyecto está construido bajo una arquitectura separada:
- **Frontend:** Desarrollado con el framework Angular, encargado de la interfaz gráfica y la experiencia del usuario.
- **Backend:** Construido con Laravel (PHP), funciona como una API RESTful que procesa la lógica de negocio y gestiona la base de datos MySQL.

## 🚀 Instalación

### Requisitos previos
- [Node.js LTS](https://nodejs.org/es/download/) y npm
- [PHP 8.2 o superior](https://www.php.net/downloads.php) (XAMPP incluye PHP)
- [Composer 2](https://getcomposer.org/download/)
- [XAMPP](https://www.apachefriends.org/es/index.html)

### Pasos

```bash
# 0. Clonar el repositorio
git clone https://github.com/juandiegomm27/UranusData.git
cd UranusData

# 1. Inicia Apache y MySQL desde XAMPP.

# 2. Instalar dependencias automatica
npm run setup

# 2. Instalar dependencias del frontend
npm ci

# 3. Instalación de Ngx-Charts para las gráficas del dashboard
npm install @swimlane/ngx-charts --save

# 4. Configurar el backend Laravel
cd laravel-backend

# Crear carpeta cache si no existe
php -r "is_dir('bootstrap/cache') || mkdir('bootstrap/cache', 0755, true);"

composer install

Copy-Item .env.example .env
php artisan key:generate

# 5. Configurar base de datos en .env
DB_HOST=127.0.0.1
DB_PORT=3306
DB_DATABASE=UranusData
DB_USERNAME=root
DB_PASSWORD=

# 6. Crear tablas y cargar datos iniciales (tener encendido XAMPP con Apache y Mysql)
php artisan migrate:fresh --seed 

php artisan config:clear 
php artisan route:clear   

# 7. Crear el enlace de almacenamiento público
php artisan storage:link

# 8. Volver a la raíz del proyecto
cd ..
```

La primera instalación necesita que cada computadora configure su propia base de datos y genere su propio APP_KEY. No compartas el archivo local laravel-backend/.env; el repositorio incluye .env.example para que cada persona genere el suyo.


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

php artisan tinker --execute="Mail::raw('Prueba exitosa', function(\$m) { \$m->to('correo_destino@gmail.com')->subject('Prueba SMTP'); });"
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

Una segunda forma para iniciarlos por separado:

```bash
# Terminal 1, desde la raíz
ng serve

# Terminal 2, desde la laravel-backend
cd laravel-backend
php artisan serve  
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
| 1234567890 | Juan Diego Medina Mahecha | Docente | 1234567890 |
| 1234567891 | Juan Diego Medina Mahecha | Técnico | 1234567890 |
| 1234567892 | Juan Diego Medina Mahecha | Gerente | 1234567890 |

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
