#!/bin/sh

echo "Verificando estado del entorno de Laravel..."

# 1. Verificar si existe el archivo .env
if [ ! -f ".env" ]; then
    echo "✅ Creando archivo .env a partir de .env.example..."
    cp .env.example .env
fi

# 2. Asegurar que las carpetas de caché existan
echo "✅ Configurando carpetas de almacenamiento y caché..."
mkdir -p bootstrap/cache
mkdir -p storage/framework/views
mkdir -p storage/framework/cache
mkdir -p storage/framework/sessions
chmod -R 777 bootstrap/cache storage

# 3. Instalar dependencias si el volumen de vendor está vacío
if [ ! -f "vendor/autoload.php" ]; then
    echo "✅ Instalando dependencias de Composer (solo la primera vez)..."
    composer install --no-interaction --prefer-dist
fi

# 4. Generar la llave solo si no existe
if ! grep -q "^APP_KEY=." .env; then
    echo "✅ Generando APP_KEY..."
    php artisan key:generate --no-interaction
fi

# 5. Migraciones (conservan los datos). Espera a que MySQL esté listo.
echo "✅ Ejecutando migraciones de la base de datos..."
intentos=0
until php artisan migrate --force; do
    intentos=$((intentos + 1))
    if [ "$intentos" -ge 20 ]; then
        echo "❌ No se pudieron ejecutar las migraciones. Revisa el error de arriba."
        exit 1
    fi
    echo "⏳ Reintentando en 3 segundos ($intentos/20)..."
    sleep 3
done

# 6. Datos iniciales SOLO si la base está vacía
USUARIOS=$(php -r 'require "vendor/autoload.php"; $app = require "bootstrap/app.php"; $app->make(Illuminate\Contracts\Console\Kernel::class)->bootstrap(); echo Illuminate\Support\Facades\DB::table("usuario")->count();')
if [ "$USUARIOS" = "0" ]; then
    echo "✅ Base vacía: cargando datos iniciales..."
    php artisan db:seed --force
else
    echo "✅ La base ya tiene datos: no se vuelve a sembrar."
fi

echo "✅ Todo listo. Encendiendo servidor..."
# 7. Arrancar el servidor de Laravel
exec php artisan serve --host=0.0.0.0 --port=8000