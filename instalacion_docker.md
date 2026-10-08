![Logo de UranusData](./public/logo-largo-color.svg)

# 🚀 UranusData - Entorno de Desarrollo con Docker

¡Bienvenido al repositorio de UranusData! Hemos migrado nuestra infraestructura a Docker para garantizar que todos los miembros del equipo tengan exactamente el mismo entorno de desarrollo, sin conflictos de versiones.


## 📋 Requisitos Previos

Antes de comenzar, asegúrate de tener instalados los siguientes programas en tu computadora:
- [Git](https://git-scm.com/downloads) 
- [Docker Desktop](https://www.docker.com/products/docker-desktop/)


## 🛠️ Guía de Instalación Paso a Paso

### Paso 1: Clonar el repositorio
Abre tu terminal, navega a la carpeta donde deseas guardar el proyecto y ejecuta:
```bash
# 0. Clonar el repositorio
git clone https://github.com/juandiegomm27/UranusData.git
cd UranusData

# 1. inicia docker

# 2. crea la carpeta .env
cd laravel-backend
cp .env.example .env
mkdir bootstrap/cache

# 3. Configurar base de datos en .env
DB_CONNECTION=mysql
DB_HOST=mysql
DB_PORT=3306
DB_DATABASE=uranusdata
DB_USERNAME=uranusdata_user
DB_PASSWORD=uranusdata_password

# 4. Vuelve a la raíz del proyecto:
cd ..

# 5. Instalar dependencias de PHP (Composer)
docker-compose run --rm backend composer install

# 6. Construir y levantar los contenedores
docker-compose up -d --build

# 7. Instalar dependencias y configurar la Base de Datos

docker-compose exec backend composer install

# 7.1. Generar la llave de seguridad de Laravel
docker-compose exec backend php artisan key:generate

# 7.2. Ejecutar migraciones
docker-compose exec backend php artisan migrate:fresh --seed

```


## 🌐 Accesos del Sistema

¡Listo! Tu entorno está funcionando. Puedes acceder a las diferentes partes del proyecto a través de tu navegador:

* 🖥️ **Frontend (Angular):** [http://localhost:4200](http://localhost:4200?utm_source=gemini)
* ⚙️ **Backend API (Laravel):** [http://localhost:8000/api](http://localhost:8000/api?utm_source=gemini)
* 🗄️ **Base de Datos (Si habilitaron phpMyAdmin):** [http://localhost:8080](http://localhost:8080?utm_source=gemini)

**Credenciales de acceso a la Base de Datos (Cliente externo):**

* **Host:** `127.0.0.1` o `localhost`
* **Puerto:** `3306`
* **Usuario:** `uranusdata_user`
* **Contraseña:** `uranusdata_password`



## 🧯 Comandos Útiles para el Día a Día

Aquí tienes los comandos de Docker que más utilizarás durante el desarrollo (siempre ejecútalos desde la raíz del proyecto):

* **Apagar todo el proyecto:**
```bash
docker-compose down
```

* **Encender el proyecto (sin reconstruir):**
```bash
docker-compose up -d
```


* **Ver los errores (Logs) en tiempo real del Frontend:**
```bash
docker-compose logs -f frontend
```


* **Ver los errores (Logs) en tiempo real del Backend:**
```bash
docker-compose logs -f backend
```


* **Ejecutar un comando de artisan (Ejemplo: crear un controlador):**
```bash
docker-compose exec backend php artisan make:controller MiControlador
```
* **Instalar dependencias de PHP (Composer)**

```bash
docker-compose exec backend composer install
```

* **Limpiar cache**
```bash
docker-compose exec backend php artisan config:clear        
docker-compose exec backend php artisan cache:clear
```

* **Elimina la carpeta vendor y el contenido cache**
```bash
docker-compose exec backend rm -rf vendor bootstrap/cache/*.php
```

* **reiniciar la base**
```bash
docker-compose exec backend php artisan migrate:fresh --seed
```