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

