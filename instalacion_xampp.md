![Logo de UranusData](./public/logo-largo-color.svg)

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
```
---
**si falla prueva manualmente**
```bash
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