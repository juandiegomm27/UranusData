![Logo de UranusData](../public/logo-largo-color.svg)

# 🐳 Backend Laravel · Instalación con Docker

Levanta el backend **heredado** de Laravel con MySQL dentro de contenedores, sin
instalar PHP, Composer ni MySQL en tu máquina.

---

## El comando

Desde la **raíz del proyecto**:

```bash
docker compose --profile legacy up -d mysql backend frontend
```

Eso enciende exactamente tres contenedores y nada más:

| Contenedor | Imagen | Puerto | Para qué |
| --- | --- | --- | --- |
| **uranusdata-mysql** | mysql:8.0 | 3306 | base de datos |
| **uranusdata-backend** | se construye desde **laravel-backend/** | 8000 | la API |
| **uranusdata-frontend** | se construye desde la raíz | 4200 | Angular |

La primera vez tarda varios minutos: el contenedor instala Composer, genera el
**APP_KEY**, corre las migraciones y siembra los datos iniciales él solo. Las siguientes
veces arranca en segundos.

### Antes: apaga Spring Boot

Los dos backends publican el **puerto 8000** y no pueden correr a la vez. Si Spring
está encendido, Docker fallará con un error de puerto ocupado:

```bash
docker compose stop spring-backend
```

---

## Requisitos previos

- [Git](https://git-scm.com/downloads)
- [Docker Desktop](https://www.docker.com/products/docker-desktop/)

PHP, Composer, MySQL y Node viajan dentro de las imágenes.

---

## Instalación paso a paso

### 1. Descargar el repositorio

```bash
git clone https://github.com/juandiegomm27/UranusData.git
```

```bash
cd UranusData
```

### 2. Levantar los contenedores

```bash
docker compose --profile legacy up -d mysql backend frontend
```

### 3. Seguir el arranque

El **entrypoint.sh** imprime cada paso. Espera a ver **Todo listo. Encendiendo servidor...**:

```bash
docker compose logs -f backend
```

### 4. Comprobar que responde

```bash
curl http://localhost:8000/api/login -X POST -H "Content-Type: application/json" -d "{\"documento\":\"1234567890\",\"password\":\"1234567890\"}"
```

---

## Accesos

| Qué | URL |
| --- | --- |
| 🖥️ Frontend (Angular) | http://localhost:4200 |
| ⚙️ API (Laravel) | http://localhost:8000/api |

**Conexión a MySQL desde un cliente externo**

| Dato | Valor |
| --- | --- |
| Host | **localhost** |
| Puerto | **3306** |
| Base de datos | **uranusdata** |
| Usuario | **uranusdata_user** |
| Contraseña | **uranusdata_password** |
| Contraseña de root | **root** |

---

## Depurar

Todos los comandos se lanzan desde la **raíz del proyecto**.

**Ver los logs en vivo**

```bash
docker compose logs -f backend
```

**Abrir una terminal dentro del contenedor**

```bash
docker exec -it uranusdata-backend bash
```

**Lanzar comandos de artisan**

```bash
docker exec -it uranusdata-backend php artisan route:list
```

**Abrir la consola de MySQL**

```bash
docker exec -it uranusdata-mysql mysql -u uranusdata_user -puranusdata_password uranusdata
```

**Limpiar la caché de configuración y rutas**

```bash
docker exec -it uranusdata-backend sh -c "php artisan config:clear && php artisan route:clear"
```

**Rehacer la base desde cero, con datos de prueba**

```bash
docker exec -it uranusdata-backend php artisan migrate:fresh --seed
```

**Reconstruir la imagen tras tocar el Dockerfile o el entrypoint**

```bash
docker compose --profile legacy up -d --build backend
```


## Apagar

**Parar los contenedores de Laravel, conservando los datos**

```bash
docker compose --profile legacy stop mysql backend
```

**Borrarlos**

```bash
docker compose --profile legacy down
```

**Borrarlos junto con los datos de MySQL**

```bash
docker compose --profile legacy down -v
```


## Volver al backend de Spring Boot

```bash
docker compose --profile legacy stop mysql backend
```

```bash
docker compose up -d postgres mailpit spring-backend frontend
```


## Si algo falla

**«port is already allocated» en el 8000** — Spring Boot sigue encendido:

```bash
docker compose stop spring-backend
```

**failed to set up container networking: network ... not found** — Docker Desktop se
reinició y creó una red nueva, pero el contenedor sigue apuntando a la vieja. Bórralo y
deja que Compose lo vuelva a crear:

```bash
docker rm -f uranusdata-mysql uranusdata-backend
```

```bash
docker compose --profile legacy up -d mysql backend frontend
```

**Las migraciones reintentan y fallan** — MySQL todavía no termina de iniciar. El
entrypoint reintenta 20 veces cada 3 segundos; si agota los intentos, revisa el log de
la base:

```bash
docker compose logs mysql
```

**El contenedor arranca pero la API responde 500** — casi siempre falta el **APP_KEY** o
sobra caché vieja:

```bash
docker exec -it uranusdata-backend sh -c "php artisan key:generate && php artisan config:clear"
```

**Empezar de cero**

```bash
docker compose --profile legacy down -v
```

```bash
docker compose --profile legacy up -d --build mysql backend frontend
```

---

## Otras guías

- 🐘 [Instalación con XAMPP](./instalacion_xampp.md) — este mismo backend, sin Docker
- 📘 [README del backend Laravel](./README_BACKEND_LARAVEL.md) — endpoints y estructura
- ☕ [Backend Spring Boot con Docker](../spring-backend/instalacion_docker.md) — el sistema actual
- 📖 [Documentación de la API REST](../DOCUMENTATION.md)
