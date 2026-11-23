![Logo de UranusData](public/logo-largo-color.svg)

UranusData es una plataforma centralizada que digitaliza y automatiza el control de
inventario de la I.E. Santa Isabel de Hungría. Permite seguir la trazabilidad de los
equipos registrados y gestionar su ciclo de vida mediante módulos de reservas, préstamos
y mantenimientos preventivos o correctivos.

---

##  Arquitectura

El sistema son dos piezas: una aplicación web y una API.

- **Frontend:** Angular 22. Interfaz y experiencia de usuario.
- **Backend:** Spring Boot 4 sobre Java 25, con PostgreSQL 17. Expone una API REST y
  concentra la lógica de negocio.

El backend es un **monolito modular**: una sola aplicación que se despliega entera, pero
dividida por dentro en módulos con fronteras claras. Cada módulo agrupa todo lo suyo y se
organiza siempre con las mismas capas, de modo que cualquiera sepa dónde buscar.

```
com.uranusdata
├── shared          Respuestas de la API, errores, correo, límites de peticiones
├── auth            Login, logout y recuperación de contraseña
├── usuarios        Perfil propio y gestión de usuarios
├── inventario      (pendiente)
├── mantenimiento   (pendiente)
└── reservas        (pendiente)
```

Dentro de cada módulo: controller recibe la petición, service aplica las reglas,
repository habla con la base, domain son las entidades y dto lo que entra y sale
en JSON.

La seguridad usa JWT firmado con HS256. El token se valida contra la base de datos en
cada petición, así que desactivar o bloquear a alguien tiene efecto inmediato y no cuando
caduque su sesión.

### Migración en curso

El backend original en Laravel se está sustituyendo por el de Spring Boot. Ambos exponen
la misma URL base y el mismo formato JSON, por lo que el frontend apenas cambia.

| Módulo | Estado |
| --- | --- |
| Autenticación (login y logout) | ✅ migrado |
| Recuperación de contraseña | ✅ migrado |
| Perfil de usuario | ✅ migrado |
| Gestión de usuarios | ✅ migrado |
| Inventario, mantenimiento, reservas y dashboard | ⏳ pendientes, siguen en Laravel |

Laravel se conserva en el perfil **legacy** de Docker Compose. **No puede correr a la vez
que Spring**, porque ambos usan el puerto 8000.

---

## 🚀 Cómo descargar, construir y ejecutar

### Camino rápido, todo con Docker

Solo necesitas [Git](https://git-scm.com/downloads) y
[Docker Desktop](https://www.docker.com/products/docker-desktop/).

```bash
git clone https://github.com/juandiegomm27/UranusData.git
```

```bash
cd UranusData
```

Crea el archivo **.env** en la raíz con el secreto de los tokens:

```bash
printf 'JWT_SECRET=%s\n' "$(openssl rand -base64 48)" > .env
```

Levanta el stack actual, que son cuatro contenedores:

```bash
docker compose up -d --build postgres mailpit spring-backend frontend
```

Cuando termine, abre **http://localhost:4200**. La base de datos y los datos de prueba se
crean solos con Flyway al arrancar el backend.

### En local, con los scripts de npm

Angular vive en la raíz del repositorio. Necesitas
[Node.js LTS](https://nodejs.org/es/download/) y, para el backend, el
[JDK 25](https://adoptium.net/).

```bash
npm ci
```

Levanta la base de datos y el buzón de correo, que sí van en contenedores:

```bash
npm run start:db
```

Y arranca Angular y Spring Boot juntos:

```bash
npm start
```

| Script | Qué levanta |
| --- | --- |
| **npm start** | Angular + Spring Boot, el stack actual |
| **npm run start:frontend** | solo Angular, en el 4200 |
| **npm run start:backend** | solo Spring Boot, en el 8000 |
| **npm run start:db** | PostgreSQL y Mailpit en Docker |
| **npm run start:laravel** | Angular + Laravel, el stack heredado |
| **npm run start:backend:laravel** | solo Laravel, en el 8000 |

Los dos backends usan el 8000, así que **npm start** y **npm run start:laravel** no
pueden correr a la vez.

---

## 📂 Cómo está organizado el repositorio

Cada tecnología tiene su carpeta, y cada carpeta lleva dentro sus propias guías de
instalación y depuración.

```
UranusData/
├── src/  public/  angular.json  package.json   Angular 22 (la raíz es el frontend)
├── README.md                                   este archivo
├── DOCUMENTATION.md                            contrato de la API REST
├── docker-compose.yml                          los tres stacks y sus bases de datos
│
├── spring-backend/                             Spring Boot 4 + PostgreSQL 17  ← actual
│   ├── README_BACKEND_SPRING-BOOT.md
│   ├── instalacion_docker.md
│   └── depuracion_local.md
│
└── laravel-backend/                            Laravel 12 + MySQL 8  ← heredado
    ├── README_BACKEND_LARAVEL.md
    ├── instalacion_docker.md
    └── instalacion_xampp.md
```

### Guías completas

| Guía | |
| --- | --- |
| [Spring Boot con Docker](./spring-backend/instalacion_docker.md) | levantar el sistema actual en contenedores |
| [Spring Boot sin Docker](./spring-backend/depuracion_local.md) | compilar, ejecutar y depurar en tu máquina |
| [README del backend Spring Boot](./spring-backend/README_BACKEND_SPRING-BOOT.md) | arquitectura, módulos, base de datos y usuarios de prueba |
| [Laravel con Docker](./laravel-backend/instalacion_docker.md) | levantar el backend heredado en contenedores |
| [Laravel con XAMPP](./laravel-backend/instalacion_xampp.md) | instalar y depurar el heredado sin Docker |
| [Documentación de la API REST](./DOCUMENTATION.md) | endpoints, formatos de respuesta y códigos de estado |

### Los dos comandos de Docker

Los dos backends publican el puerto 8000, así que **no pueden correr a la vez**.

```bash
docker compose up -d postgres mailpit spring-backend frontend

docker compose --profile legacy up -d mysql backend frontend
```

---

## 🔑 Roles y funcionalidades

| Rol |  |
| --- | --- |
| Docente | Consultar disponibilidad, solicitar reservas y seguir sus préstamos |
| Técnico | Registrar inventario, enviar y cerrar mantenimientos, entregar y recibir equipos |
| Gerente | Gestión de usuarios, supervisión de inventario, mantenimientos y préstamos |

## 👤 Credenciales de prueba

Todos los usuarios de prueba comparten la contraseña **1234567890**.

| Documento | Nombre | Rol |
| --- | --- | --- |
| 1234567890 | Juan Diego Medina Mahecha | Docente |
| 1234567891 | Juan Diego Medina Mahecha | Técnico |
| 1234567892 | Juan Diego Medina Mahecha | Gerente |

La lista completa, con los usuarios en estado inactivo y bloqueado que sirven para probar
esos caminos, está en
[spring-backend/README_BACKEND_SPRING-BOOT.md](./spring-backend/README_BACKEND_SPRING-BOOT.md).

## 📧 Características

- ✅ Autenticación con JWT y contraseñas cifradas con BCrypt
- ✅ Bloqueo por intentos fallidos y límite de peticiones por IP
- ✅ Recuperación de contraseña por correo con enlace de un solo uso
- ✅ Notificaciones por correo
- ✅ Modo claro/oscuro
- ✅ Edición de perfil con validación en cliente y servidor

## 🔐 Seguridad

- Contraseñas cifradas con BCrypt (coste 12)
- Tokens JWT HS256 revocables, validados contra la base en cada petición
- El token de recuperación se guarda solo como hash SHA-256
- Autorización por rol en el servidor, además de los guards del frontend
- CORS restringido a los orígenes configurados

## 👥 Autores

- Juan Diego Medina Mahecha
- Sofia Avila Martinez
- Juan David Bernal Torres
- Juan Camilo Aguirre Rojas

## 📄 Licencia

Proyecto académico para el SENA · Sistema Integrado de Gestión
