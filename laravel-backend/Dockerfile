FROM php:8.2-cli

# Instalar dependencias del sistema (Agregamos 'dos2unix' para evitar errores de saltos de línea de Windows)
RUN apt-get update && apt-get install -y \
    git \
    curl \
    libpng-dev \
    libjpeg-dev \
    libfreetype6-dev \
    zip \
    unzip \
    dos2unix \
    && docker-php-ext-configure gd --with-freetype --with-jpeg \
    && docker-php-ext-install -j$(nproc) gd pdo pdo_mysql opcache

# OPcache: evita recompilar Laravel en cada petición (los cambios de código se ven en ~2 s)
RUN { \
    echo 'opcache.enable=1'; \
    echo 'opcache.memory_consumption=192'; \
    echo 'opcache.max_accelerated_files=20000'; \
    echo 'opcache.validate_timestamps=1'; \
    echo 'opcache.revalidate_freq=2'; \
} > /usr/local/etc/php/conf.d/opcache.ini

# Instalar Composer
COPY --from=composer:latest /usr/bin/composer /usr/bin/composer

WORKDIR /app

# Exponer puerto para artisan serve
EXPOSE 8000

# Copiar el script de entrypoint, corregir saltos de línea y darle permisos de ejecución
COPY entrypoint.sh /usr/local/bin/entrypoint.sh
RUN dos2unix /usr/local/bin/entrypoint.sh && chmod +x /usr/local/bin/entrypoint.sh

# El comando por defecto ahora es el script, no el php artisan serve directo
CMD ["/usr/local/bin/entrypoint.sh"]