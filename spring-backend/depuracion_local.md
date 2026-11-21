![Logo de UranusData](../public/logo-largo-color.svg)

# Backend Spring Boot

## Requisitos previos

| Herramienta | Versión |  |
| --- | --- | --- |
| [JDK Temurin](https://adoptium.net/) | **25** | compilar y ejecutar |
| [Docker Desktop](https://www.docker.com/products/docker-desktop/) | cualquiera | PostgreSQL, el buzón de correo y las pruebas |

## El comando

```bash
cd spring-backend
.\mvnw.cmd spring-boot:run
```


## Preparación, una sola vez


Guarda ahí el secreto con que se firman los tokens. Desde la **raíz del proyecto**:

```bash
# Crear el archivo .env de la raíz
printf 'JWT_SECRET=%s\n' "$(openssl rand -base64 48)" > .env
```

Si no tienes **openssl**, crea el archivo a mano con una línea
**JWT_SECRET=** y al menos 32 bytes aleatorios detrás.

### 2. Levantar la base de datos y el buzón de correo

Son los dos únicos contenedores que necesitas. Desde la **raíz del proyecto**:

```bash
docker compose up -d postgres mailpit
docker compose ps
```

**uranusdata-postgres** tiene que aparecer como **healthy**.


## Construir


```bash
cd spring-backend

# Compilar y empaquetar sin pasar las pruebas
.\mvnw.cmd clean package -DskipTests

# Compilar solo, sin empaquetar
.\mvnw.cmd clean compile

# Borrar lo compilado — resuelve los arranques en los que Spring sirve clases viejas:
.\mvnw.cmd clean
```


## Ejecutar

```bash
.\mvnw.cmd spring-boot:run
```

Desde la raíz del proyecto tienes dos atajos equivalentes:

```bash
# backend
npm run start:backend

# angular
npm start
```

El primero arranca solo el backend; el segundo levanta además Angular en el 4200.

**Comprobar que responde**

```bash
curl http://localhost:8000/api/actuator/health
```

```bash
curl -X POST http://localhost:8000/api/login -H "Content-Type: application/json" -d "{\"documento\":\"1234567892\",\"password\":\"1234567890\"}"
```

| | URL |
| --- | --- |
| API | http://localhost:8000/api |
| Buzón de correo | http://localhost:8025 |
| Frontend | http://localhost:4200 |

---

## Depurar

### Enganchar el depurador del IDE

Arranca la aplicación abriendo el puerto de depuración **5005**:

```bash
.\mvnw.cmd spring-boot:run "-Dspring-boot.run.jvmArguments=-agentlib:jdwp=transport=dt_socket,server=y,suspend=n,address=*:5005"
```

Luego, en tu IDE, crea una configuración **Remote JVM Debug** contra **localhost:5005**
y conéctate. Los puntos de ruptura ya funcionan.

Para que la aplicación **espere** a que te conectes antes de arrancar, cambia
**suspend=n** por **suspend=y**.

### Ver el SQL que lanza Hibernate

```bash
.\mvnw.cmd spring-boot:run "-Dspring-boot.run.arguments=--spring.jpa.show-sql=true --spring.jpa.properties.hibernate.format_sql=true"
```

### Subir el detalle del log

```bash
.\mvnw.cmd spring-boot:run "-Dspring-boot.run.arguments=--logging.level.com.uranusdata=DEBUG --logging.level.org.springframework.security=DEBUG"
```

### Revisar los correos que envía la aplicación

Nada sale a internet: todo cae en Mailpit, en http://localhost:8025.

### Mirar la base de datos

```bash
docker exec -it uranusdata-postgres psql -U uranusdata_user -d uranusdata
```

Con interfaz gráfica, levanta pgAdmin en http://localhost:5050
(usuario **admin@uranusdata.com**, contraseña **admin**):

```bash
docker compose --profile tools up -d pgadmin
```

Dentro de pgAdmin, el servidor se registra con host **postgres**, puerto **5432**, base
**uranusdata**, usuario **uranusdata_user** y contraseña **uranusdata_password**.

---

## Pruebas

```bash
.\mvnw.cmd test
```

**Pasar una sola clase de prueba**

```bash
.\mvnw.cmd test -Dtest=LoginContratoTest
```

**Pasar un solo método**

```bash
.\mvnw.cmd test -Dtest=LoginContratoTest#loginCorrecto
```

---

## Si algo falla

**Web server failed to start. Port 8000 was already in use** — hay otro backend
encendido. Puede ser Laravel, el contenedor **spring-backend**, o una ejecución anterior
que no murió:

```bash
docker compose stop spring-backend backend
```

En Windows, para encontrar y matar el proceso que ocupa el puerto:

```bash
netstat -ano | findstr :8000
```

```bash
taskkill /PID <el_numero_que_salio> /F
```

**Connection to localhost:5432 refused** — PostgreSQL no está levantado:

```bash
docker compose up -d postgres
```

**Validate failed: Migration checksum mismatch** — se editó un archivo de
**db/migration** que Flyway ya había aplicado. Si el cambio era solo cosmético:

```bash
.\mvnw.cmd org.flywaydb:flyway-maven-plugin:12.4.0:repair "-Dflyway.url=jdbc:postgresql://localhost:5432/uranusdata" "-Dflyway.user=uranusdata_user" "-Dflyway.password=uranusdata_password"
```

Si el cambio era de verdad, borra la base y deja que Flyway la rehaga:

```bash
docker compose down -v
```

```bash
docker compose up -d postgres mailpit
```

**Schema-validation: missing table** — **ddl-auto** está en **validate**, así que
Hibernate no crea nada: la tabla tiene que venir de una migración de Flyway. Añade la
migración que falte.

**Rutas nuevas que responden 404 aunque compilaron** — DevTools se quedó con un
reinicio a medias:

```bash
.\mvnw.cmd clean
```

```bash
.\mvnw.cmd spring-boot:run
```

**invalid target release: 25** — Maven está usando otro JDK. Apunta **JAVA_HOME** al 25.

---

## Usar un PostgreSQL instalado en tu máquina

Si no quieres el contenedor, crea la base y el usuario a mano y pasa los datos por
variables de entorno. La aplicación lee estas, con los valores por defecto entre
paréntesis:

| Variable | Por defecto |
| --- | --- |
| **DB_HOST** | localhost |
| **DB_PORT** | 5432 |
| **DB_NAME** | uranusdata |
| **DB_USERNAME** | uranusdata_user |
| **DB_PASSWORD** | uranusdata_password |
| **MAIL_HOST** | localhost |
| **MAIL_PORT** | 2525 |

En PowerShell:

```bash
$env:DB_PORT="5433"; .\mvnw.cmd spring-boot:run
```

Flyway creará el esquema entero en la primera ejecución, incluidos los usuarios de
prueba.

---

## Otras guías

- 🐳 [Este mismo backend con Docker](./instalacion_docker.md)
- 📘 [README del backend Spring Boot](./README_BACKEND_SPRING-BOOT.md) — arquitectura, módulos y usuarios de prueba
- 📖 [Documentación de la API REST](../DOCUMENTATION.md)
- 🐘 [Backend heredado de Laravel](../laravel-backend/README_BACKEND_LARAVEL.md)
