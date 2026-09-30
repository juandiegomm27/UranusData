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

# 4. Generar la llave (solo si no se ha generado antes)
echo "✅ Generando APP_KEY..."
php artisan key:generate --no-interaction

# 5. Ejecutar migraciones automáticamente
echo "✅ Ejecutando migraciones de la base de datos..."
php artisan migrate:fresh --seed --force

echo "✅ Todo listo. Encendiendo servidor..."
# 6. Arrancar el servidor de Laravel
exec php artisan serve --host=0.0.0.0 --port=8000