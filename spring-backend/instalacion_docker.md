![Logo de UranusData](../public/logo-largo-color.svg)

# Backend Spring Boot · Instalación con Docker
## Requisitos previos

- [Git](https://git-scm.com/downloads)
- [Docker Desktop](https://www.docker.com/products/docker-desktop/)

Nada más. Java, Maven, Node y PostgreSQL viajan dentro de las imágenes.

## El comando

Desde la **raíz del proyecto**:

```bash
docker compose up -d postgres mailpit spring-backend frontend
```


### No puede correr a la vez que Laravel

Los dos backends publican el **puerto 8000**. Si el contenedor de Laravel está
encendido, Docker fallará con un error de puerto ocupado:

```bash
docker compose --profile legacy stop backend mysql
```


---

## Instalación paso a paso


```bash
# Descargar el repositorio
git clone https://github.com/juandiegomm27/UranusData.git
cd UranusData

# Crear el archivo `.env` de la raíz
printf 'JWT_SECRET=%s\n' "$(openssl rand -base64 48)" > .env

# Construir y levantar
docker compose up -d --build postgres mailpit spring-backend frontend

# Comprobar que los servicios están sanos
docker compose ps

# Probar la API
curl http://localhost:8000/api/actuator/health
```


## Accesos

| | URL |
| --- | --- |
| 🖥️ Frontend (Angular) | http://localhost:4200 |
| ⚙️ API (Spring Boot) | http://localhost:8000/api |
| 📧 Buzón de correo | http://localhost:8025 |
| 🗄️ pgAdmin | http://localhost:5050 |

**Conexión a PostgreSQL desde un cliente externo**

| Dato | Valor |
| --- | --- |
| Host | **localhost** |
| Puerto | **5432** |
| Base de datos | **uranusdata** |
| Usuario | **uranusdata_user** |
| Contraseña | **uranusdata_password** |

**Usuarios de prueba** — todos con la contraseña **1234567890**:

| Documento | Rol |
| --- | --- |
| 1234567890 | Docente |
| 1234567891 | Técnico |
| 1234567892 | Gerente |

La lista completa, con los usuarios inactivo y bloqueado, está en el
[README del backend](./README_BACKEND_SPRING-BOOT.md).

---

## Depurar

Todos los comandos se lanzan desde la **raíz del proyecto**.

**Ver los logs del backend en vivo**

```bash
docker compose logs -f spring-backend
```

**Ver los logs del frontend en vivo**

```bash
docker compose logs -f frontend
```

**Reconstruir el backend tras cambiar código Java**

```bash
docker compose up -d --build spring-backend
```

**Abrir una terminal dentro del contenedor**

```bash
docker exec -it uranusdata-spring sh
```

**Abrir la consola de PostgreSQL**

```bash
docker exec -it uranusdata-postgres psql -U uranusdata_user -d uranusdata
```

**Levantar pgAdmin** — usuario **admin@uranusdata.com**, contraseña **admin**:

```bash
docker compose --profile tools up -d pgadmin
```

Dentro de pgAdmin el servidor se registra con host **postgres** (no **localhost**:
estás dentro de la red de Docker), puerto **5432**, base **uranusdata**, usuario
**uranusdata_user** y contraseña **uranusdata_password**.

> Para depurar paso a paso con puntos de ruptura, ejecuta el backend fuera de Docker:
> [depuracion_local.md](./depuracion_local.md).

---

## Apagar

**Parar, conservando los datos**

```bash
docker compose stop
```

**Borrar los contenedores**

```bash
docker compose down
```

**Borrarlos junto con los datos de PostgreSQL**

```bash
docker compose down -v
```

---

## Si algo falla

**«port is already allocated» en el 8000** — el backend de Laravel está encendido:

```bash
docker compose --profile legacy stop backend mysql
```

**failed to set up container networking: network ... not found** — Docker Desktop se
reinició y creó una red nueva, pero el contenedor sigue apuntando a la vieja. Bórralo y
deja que Compose lo vuelva a crear:

```bash
docker rm -f uranusdata-spring uranusdata-postgres uranusdata-mailpit uranusdata-frontend
```

```bash
docker compose up -d postgres mailpit spring-backend frontend
```

**El backend no arranca y el log habla de la base** — PostgreSQL todavía no estaba
listo. El contenedor depende de su healthcheck, así que basta reintentar:

```bash
docker compose up -d --force-recreate spring-backend
```

**Migration checksum mismatch** — las migraciones que lleva dentro la imagen no son
las que hay en disco. Casi siempre es una imagen vieja: reconstrúyela.

```bash
docker compose up -d --build spring-backend
```

Si el desajuste persiste, es que de verdad se editó una migración ya aplicada. Borra la
base y deja que Flyway la rehaga:

```bash
docker compose down -v
```

```bash
docker compose up -d --build postgres mailpit spring-backend frontend
```

**Empezar de cero del todo**

```bash
docker compose down -v
```

```bash
docker compose up -d --build postgres mailpit spring-backend frontend
```

---

## Otras guías

- ☕ [Ejecutar y depurar sin Docker](./depuracion_local.md)
- 📘 [README del backend Spring Boot](./README_BACKEND_SPRING-BOOT.md) — arquitectura, módulos y usuarios de prueba
- 📖 [Documentación de la API REST](../DOCUMENTATION.md)
- 🐘 [Backend heredado de Laravel con Docker](../laravel-backend/instalacion_docker.md)
