![Logo de UranusData](../public/logo-largo-color.svg)

 [Inicio General](README.md) || [Info Backend](./laravel-backend/README_BACKEND.md) || [Guía de Instalación](./laravel-backend/INSTALACION.md) || [Documentación API](./laravel-backend/API_DOCUMENTATION.md)
 
 # 🚀 Guía de Instalación - UranusData Backend

## 📋 Requisitos Previos

- **PHP** 8.2 o superior
- **MySQL** 8.0 o superior (o MariaDB 10.4+)
- **Composer** 2.0 o superior
- **Node.js** (opcional, para assets)

---

## 🔧 Instalación Paso a Paso

### 1.  Clonar el repositorio

```bash
git clone https://github.com/tu-usuario/uranusdata-backend.git
cd uranusdata-backend
```

### 2️. Instalar dependencias

```bash
composer install
```

### 3️. Copiar archivo de configuración

```bash
cp .env.example .env
```

### 4️. Generar clave de aplicación

```bash
php artisan key:generate
```

### 5️. Configurar base de datos

**Editar `.env`:**
```env
DB_CONNECTION=mysql
DB_HOST=127.0.0.1
DB_PORT=3306
DB_DATABASE=uranusdata
DB_USERNAME=root
DB_PASSWORD=tu_password
```

### 6️. Ejecutar migraciones

```bash
php artisan migrate
```

### 7️. Ejecutar seeders (opcional, para datos de prueba)

```bash
php artisan db:seed
```

### 8️. Iniciar servidor de desarrollo

```bash
php artisan serve
```

✅ **API disponible en:** `http://localhost:8000/api`

---

## 🐳 Con Docker (Recomendado)

### Opción 1: Usando docker-compose

```bash
docker-compose up -d
docker-compose exec app php artisan migrate
docker-compose exec app php artisan db:seed
```

### Verificar
```bash
curl http://localhost:8000/api
```

---

## ⚙️ Configuraciones Importantes

### CORS
Editado automáticamente en `config/cors.php` para:
- `http://localhost:4200` (Angular)
- `http://localhost:3000` (React/Vue)

### Sanctum
El token expira según `config/sanctum.php`
- Actual: `null` (no expira)
- Para cambiar: `'expiration' => 60 * 24 * 365` (1 año)

### Email (Recuperación de contraseña)
En `.env`:
```env
MAIL_DRIVER=log  # Para desarrollo (muestra en storage/logs)
# Cambiar a smtp para producción
MAIL_DRIVER=smtp
MAIL_HOST=smtp.gmail.com
MAIL_PORT=587
MAIL_USERNAME=tu-email@gmail.com
MAIL_PASSWORD=tu-app-password
MAIL_ENCRYPTION=tls
```

---

##  Probar la API

### 1. Registrarse
```bash
curl -X POST http://localhost:8000/api/register \
  -H "Content-Type: application/json" \
  -d '{
    "cod_rol": 1,
    "nombre": "Test",
    "apellido": "User",
    "documento": "1234567890",
    "correo": "test@example.com",
    "password": "password123"
  }'
```

### 2. Login
```bash
curl -X POST http://localhost:8000/api/login \
  -H "Content-Type: application/json" \
  -d '{
    "documento": "1234567890",
    "password": "password123"
  }'
```

### 3. Usar token
```bash
curl http://localhost:8000/api/perfil/1234567890 \
  -H "Authorization: Bearer {token_recibido}"
```

---

##  Seguridad en Producción

1. Cambiar `APP_DEBUG=false` en `.env`
2. Configurar `APP_ENV=production`
3. Usar variables de entorno seguros
4. Habilitar HTTPS
5. Configurar firewall
6. Usar contraseñas fuertes para DB
7. Limitar rate limiting de login
8. Usar CDN para estáticos

---

##  Estructura de Carpetas

```bash
    laravel-backend/
    ├── app/
    │ ├── Http/
    │ │ ├── Controllers/ # Lógica de negocio
    │ │ └── Middleware/ # Middlewares (auth, roles)
    │ ├── Models/ # Modelos Eloquent
    │ ├── Traits/ # ApiResponse (respuestas JSON)
    │ └── Exceptions/ # Manejo de errores
    ├── routes/
    │ ├── api.php # Rutas de API
    │ └── web.php # Rutas de documentación
    ├── config/
    │ ├── cors.php # Configuración CORS
    │ ├── sanctum.php # Configuración Sanctum
    │ └── auth.php # Configuración de auth
    ├── database/
    │ ├── migrations/ # Migraciones
    │ └── seeders/ # Datos iniciales
    ├── storage/
    │ └── logs/ # Logs de la aplicación
    └── .env.example # Variables de ejemplo
```


---

##  Troubleshooting

### "Class not found"
```bash
composer dump-autoload
```

### "Migration table not found"
```bash
php artisan migrate:refresh
```

### "Permission denied" (storage)
```bash
chmod -R 775 storage bootstrap/cache
```

### CORS error
Verificar que el frontend URL está en `config/cors.php`

### Token inválido
- Regenerar key: `php artisan key:generate`
- Limpiar cache: `php artisan cache:clear`

---

Documentación API: [Ver DOCUMENTATION.md](./API_DOCUMENTATION.md)