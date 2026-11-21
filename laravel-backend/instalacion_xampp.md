![Logo de UranusData](../public/logo-largo-color.svg)

# 🐘 Backend Laravel · Instalación con XAMPP

Instala el backend **heredado** de Laravel con MySQL directamente en tu máquina, sin
Docker.

## El comando

Con Apache y MySQL encendidos en XAMPP, desde la **raíz del proyecto**:

```bash
npm run setup
```

Ese script instala las dependencias de Angular, instala las de Composer, genera el
**APP_KEY**, crea las tablas, siembra los datos y deja el enlace de almacenamiento.
Si falla, más abajo está el mismo proceso paso a paso.

---

## Requisitos previos

- [Node.js LTS](https://nodejs.org/es/download/) y npm
- [PHP 8.2 o superior](https://www.php.net/downloads.php) (XAMPP ya lo incluye)
- [Composer 2](https://getcomposer.org/download/)
- [XAMPP](https://www.apachefriends.org/es/index.html)

---

## Instalación

```bash
# 0. Clonar el repositorio
git clone https://github.com/juandiegomm27/UranusData.git
cd UranusData

# 1. Inicia Apache y MySQL desde el panel de XAMPP

# 2. Instalar todo de una vez
npm run setup
```

### Si **npm run setup** falla, hazlo a mano

```bash
# 1. Dependencias del frontend
npm ci

# 2. Gráficas del dashboard
npm install @swimlane/ngx-charts --save

# 3. Pasar al backend
cd laravel-backend

# 4. Crear la carpeta de caché si no existe
php -r "is_dir('bootstrap/cache') || mkdir('bootstrap/cache', 0755, true);"

# 5. Dependencias de PHP
composer install

# 6. Archivo de entorno y llave de la aplicación
Copy-Item .env.example .env
php artisan key:generate

# 7. Crear tablas y cargar datos iniciales
php artisan migrate:fresh --seed

php artisan config:clear
php artisan route:clear

# 8. Enlace de almacenamiento público
php artisan storage:link

# 9. Volver a la raíz
cd ..
```

Entre los pasos 6 y 7, revisa que **laravel-backend/.env** apunte a tu MySQL:

```bash
DB_HOST=127.0.0.1
DB_PORT=3306
DB_DATABASE=UranusData
DB_USERNAME=root
DB_PASSWORD=
```

Cada computadora configura su propia base y genera su propio **APP_KEY**. **No compartas
**laravel-backend/.env**: el repositorio trae **.env.example** para que cada persona haga
el suyo.

---

## Ejecución

Con Apache y MySQL encendidos en XAMPP, desde la **raíz del proyecto**:

```bash
npm run start:laravel
```

Levanta Angular y Laravel juntos.

| Qué | URL |
| --- | --- |
| 🖥️ Frontend (Angular) | http://localhost:4200 |
| ⚙️ API (Laravel) | http://localhost:8000/api |

### Por separado, en dos terminales

```bash
# Terminal 1, desde la raíz
npm run start:frontend
```

```bash
# Terminal 2, desde la raíz
npm run start:backend:laravel
```

---

## Depurar

Todos estos comandos se lanzan desde **laravel-backend**:

```bash
cd laravel-backend
```

**Ver los logs de la aplicación en vivo**

```bash
Get-Content storage/logs/laravel.log -Wait -Tail 50
```

**Listar todas las rutas registradas**

```bash
php artisan route:list
```

**Abrir una consola interactiva contra la aplicación**

```bash
php artisan tinker
```

**Limpiar la caché cuando un cambio no se refleja**

```bash
php artisan config:clear
```

```bash
php artisan route:clear
```

```bash
php artisan cache:clear
```

**Ver el estado de las migraciones**

```bash
php artisan migrate:status
```

**Rehacer la base desde cero con datos de prueba**

```bash
php artisan migrate:fresh --seed
```

**Pasar las pruebas**

```bash
php artisan test
```

---

## Configurar correos (opcional)

En **laravel-backend/.env**:

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

Para comprobar el envío:

```bash
cd laravel-backend
```

```bash
php artisan config:clear
```

```bash
php artisan tinker --execute="Mail::raw('Prueba exitosa', function(\$m) { \$m->to('correo_destino@gmail.com')->subject('Prueba SMTP'); });"
```

---

## Si algo falla

**SQLSTATE[HY000] [2002]** — MySQL no está encendido en XAMPP, o el puerto de
**laravel-backend/.env** no coincide con el de XAMPP.

**No application encryption key has been specified**

```bash
php artisan key:generate
```

**El puerto 8000 está ocupado** — hay un backend de Spring corriendo, en local o en
Docker:

```bash
docker compose stop spring-backend
```

**Un cambio en el código no se nota** — queda caché vieja:

```bash
php artisan config:clear && php artisan route:clear && php artisan cache:clear
```

---

## Otras guías

- 🐳 [Este mismo backend con Docker](./instalacion_docker.md) — sin instalar PHP ni MySQL
- 📘 [README del backend Laravel](./README_BACKEND_LARAVEL.md) — endpoints y estructura
- ☕ [Backend Spring Boot con Docker](../spring-backend/instalacion_docker.md) — el sistema actual
- 📖 [Documentación de la API REST](../DOCUMENTATION.md)
