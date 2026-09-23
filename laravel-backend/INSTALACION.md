# Instalación del backend

La guía completa para instalar y ejecutar frontend y backend desde una clonación limpia está en el [README principal](../README.md). Esta página resume los pasos del backend.

## Requisitos

- PHP 8.2 o superior y Composer 2
- MySQL 8 o MariaDB

## Primera instalación

Desde la carpeta `laravel-backend`:

```powershell
composer install
Copy-Item .env.example .env
php artisan key:generate
```

Crea una base de datos vacía `UranusData` en MySQL y configura la conexión en `.env` (`DB_HOST=127.0.0.1`, `DB_PORT=3306`, `DB_DATABASE=UranusData`, `DB_USERNAME=root`, `DB_PASSWORD=` para XAMPP predeterminado).

Luego, todavía desde `laravel-backend`:

```powershell
php artisan migrate --seed
php artisan storage:link
php artisan serve --host=127.0.0.1 --port=8000
```

La API queda en `http://localhost:8000/api`. Para entrar al sistema, instala las dependencias desde la raíz con `npm ci` y ejecuta `npm start`; la interfaz queda en `http://localhost:4200`.

Cada clonación necesita su propio `.env`, clave de aplicación y base de datos. `.env` contiene configuración local y no se debe compartir; `.env.example` sí está incluido en Git. Para volver a crear los datos en una base vacía usa `php artisan migrate --seed`. Esto no requiere ni recomienda borrar la base de datos de una instalación existente.

## Usuarios de demostración

El seeder crea estos usuarios activos; todos tienen contraseña `1234567890`:

| Documento | Rol |
| --- | --- |
| `1234567890` | Docente |
| `1234567891` | Técnico |
| `1234567892` | Gerente |

## Correo

La configuración inicial usa `MAIL_MAILER=log`. Los mensajes de recuperación se guardan en `storage/logs/laravel.log`; para enviar correos reales, cada persona debe configurar sus credenciales SMTP localmente en `.env` y nunca subirlas al repositorio.
