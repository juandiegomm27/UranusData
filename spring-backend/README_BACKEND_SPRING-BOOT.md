![Logo de UranusData](../public/logo-largo-color.svg)

# UranusData · Backend Spring Boot

API REST de UranusData. Sustituye al backend Laravel conservando la misma URL base
(http://localhost:8000/api) y los mismos nombres de campo en el JSON, para que el
frontend Angular no tenga que cambiar.

## Guías de esta carpeta

- 🐳 [Instalación con Docker](./instalacion_docker.md) — levanta API, PostgreSQL, correo y frontend en contenedores
- ☕ [Ejecutar y depurar sin Docker](./depuracion_local.md) — compilar con el wrapper de Maven y enganchar el depurador

## Requisitos

| Herramienta | Versión | |
| --- | --- | --- |
| [Git](https://git-scm.com/downloads) | cualquiera | descargar el repositorio |
| [Docker Desktop](https://www.docker.com/products/docker-desktop/) | cualquiera | PostgreSQL, el buzón de correo y las pruebas |
| [JDK Temurin](https://adoptium.net/) | **25** | compilar y ejecutar en local |


Comprueba la versión de Java antes de empezar:

```bash
java -version
```

Si no dice 25, el proyecto no compilará.

---

## Descargar el proyecto

```bash
git clone https://github.com/juandiegomm27/UranusData.git
```

```bash
cd UranusData
```

---

## Preparar el entorno

### Crear el archivo **.env** en la raíz

```bash
printf 'JWT_SECRET=%s\n' "$(openssl rand -base64 48)" > .env
```

Si no tienes **openssl**, crea el archivo a mano con una línea **JWT_SECRET=** y al menos
32 bytes aleatorios detrás.

### Levantar la base de datos y el buzón de correo

```bash
docker compose up -d postgres mailpit
```

```bash
docker compose ps
```

---

## Construir

Desde la carpeta **spring-backend**:

```bash
cd spring-backend
```

Compilar y empaquetar sin ejecutar las pruebas:

```bash
.\mvnw.cmd clean package -DskipTests
```

---

## Ejecutar

### Opción A — en local

```bash
.\mvnw.cmd spring-boot:run
```

Queda lista cuando el log muestra **Tomcat started on port 8000 (http) with context
path '/api'** seguido de **Started UranusdataApplication**. Los detalles de depuración
están en [depuracion_local.md](./depuracion_local.md).

### Opción B — dentro de Docker

```bash
docker compose up -d --build spring-backend
```

## Comprobar que funciona

```bash
curl -X POST http://localhost:8000/api/login -H "Content-Type: application/json" -d "{\"documento\":\"1234567892\",\"password\":\"1234567890\"}"
```

Debe responder 200 con un JSON que incluye "success": true y un token.

| Servicio | URL |
| --- | --- |
| API | http://localhost:8000/api |
| Buzón de correo  | http://localhost:8025 |
| pgAdmin | http://localhost:5050 |

---

## Ejecutar las pruebas

```bash
.\mvnw.cmd test
```

**Docker Desktop tiene que estar corriendo.** Las pruebas levantan su propio PostgreSQL
con Testcontainers, independiente del de Docker Compose, así que no tocan tus datos de
desarrollo.

---

## Base de datos

El esquema lo crea **Flyway** al arrancar, a partir de los archivos de
**src/main/resources/db/migration**:

| Migración | Contenido |
| --- | --- |
| **V1__nucleo.sql** | 20 tablas del núcleo |
| **V2__complementarias.sql** | 5 tablas de apoyo |
| **V3__catalogos.sql** | roles, estados, tipos, ubicaciones y marcas |
| **V4__usuarios_prueba.sql** | 15 usuarios de prueba |
| **V5__usuario_bloqueado.sql** | un usuario en estado Bloqueado |

ddl-auto está en validate: Hibernate **no** modifica el esquema, solo comprueba que
las entidades cuadran con lo que creó Flyway.

### Usuarios de prueba

Todos comparten la contraseña **1234567890**.

| Documento | Rol | Estado |
| --- | --- | --- |
| 1234567890 | Docente | Activo |
| 1234567891 | Técnico | Activo |
| 1234567892 | Gerente | Activo |
| 1000000001 – 1000000005 | Docente | Activo |
| 1000000006 | Docente | **Inactivo** |
| 1000000007 – 1000000010 | Técnico | Activo |
| 1000000011 – 1000000012 | Gerente | Activo |
| 1000000013 | Docente | **Bloqueado** |

### Empezar de cero

Para borrar los datos y que Flyway vuelva a crearlo todo:

```bash
docker compose down -v
```

```bash
docker compose up -d postgres mailpit
```