![Logo de UranusData](public/logo-largo-color.svg)

 [Inicio General](README.md) || [Info Backend](./laravel-backend/README_BACKEND.md) || [Guía de Instalación](./laravel-backend/INSTALACION.md) || [Documentación API](./laravel-backend/API_DOCUMENTATION.md)

UranusData es una plataforma centralizada que permite digitalizar y automatizar los procesos de control de inventario. El sistema facilita la trazabilidad de los equipos registrados, gestionando su ciclo de vida a través de módulos especializados para reservas, préstamos y seguimiento de mantenimientos preventivos o correctivos. 

El proyecto está construido bajo una arquitectura separada:
- **Frontend:** Desarrollado con el framework Angular, encargado de la interfaz gráfica y la experiencia del usuario.
- **Backend:** Construido con Laravel (PHP), funciona como una API RESTful que procesa la lógica de negocio y gestiona la base de datos MySQL.

## 🚀 Instalación

### Requisitos previos
- [Node.js LTS](https://nodejs.org/es/download/) y npm
- [PHP 8.2 o superior](https://www.php.net/downloads.php), con las extensiones requeridas por Laravel (XAMPP incluye PHP)
- [Composer 2](https://getcomposer.org/download/)
- MySQL 8 o MariaDB; puedes usar MySQL desde [XAMPP](https://www.apachefriends.org/es/index.html)

### Pasos

1. Clona el repositorio y entra en su carpeta:

   ```powershell
   git clone <url-del-repositorio>
   cd UranusData
   ```

2. Inicia MySQL desde XAMPP. En phpMyAdmin (`http://localhost/phpmyadmin`) crea una base de datos vacía llamada `UranusData` con cotejamiento `utf8mb4_unicode_ci`.

3. Instala y configura Laravel desde PowerShell:

   ```powershell
   cd laravel-backend
   composer install
   Copy-Item .env.example .env
   php artisan key:generate
   ```

   Abre `laravel-backend/.env` y confirma estos datos para la instalación predeterminada de XAMPP:

   ```dotenv
   DB_CONNECTION=mysql
   DB_HOST=127.0.0.1
   DB_PORT=3306
   DB_DATABASE=UranusData
   DB_USERNAME=root
   DB_PASSWORD=
   ```

4. Crea las tablas y los datos de demostración:

   ```powershell
   php artisan migrate --seed
   php artisan storage:link
   cd ..
   ```

5. Instala las dependencias de Angular y ejecuta ambos servidores:

   ```powershell
   npm ci
   npm start
   ```

   `npm ci` instala exactamente las dependencias fijadas en `package-lock.json`, incluida ngx-charts; no hace falta instalar paquetes adicionales manualmente. `npm start` inicia Angular y Laravel en paralelo.

La primera instalación necesita que cada computadora configure su propia base de datos y genere su propio `APP_KEY`. No compartas el archivo local `laravel-backend/.env`; el repositorio incluye `.env.example` para que cada persona genere el suyo.


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
