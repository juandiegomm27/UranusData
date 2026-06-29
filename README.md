# UranusData

Sistema de gestión de inventario, préstamos y mantenimiento de equipos tecnológicos, desarrollado para la **Institución Educativa Santa Isabel de Hungría**.

![preview](public/logo.png)

## 📋 Descripción

UranusData centraliza el control de los activos tecnológicos institucionales, permitiendo registrar, consultar y dar seguimiento al estado, ubicación y vida útil de los equipos, reemplazando el manejo manual mediante hojas de cálculo.

El sistema cuenta con tres roles de usuario, cada uno con su propio panel de control:

- **Docente** — Gestión de reservas de espacios y recursos.
- **Técnico** — Control de inventario y mantenimiento de equipos.
- **Gerente** — Administración de usuarios, inventario y mantenimientos a nivel general.

## 🛠️ Tecnologías

**Frontend**
- Angular 22 (Standalone Components)
- TypeScript
- RxJS
- Reactive Forms

**Backend**
- Node.js
- Express
- Nodemailer (envío de correos)
- CORS

**Testing**
- Vitest

## 📂 Estructura del Proyecto

```
src/
├── app/
│   ├── components/
│   │   ├── header/              # Barra de navegación global
│   │   ├── home/                # Paneles por rol (Docente, Tecnico, Gerente)
│   │   ├── section/              # Login, activación y recuperación de contraseña
│   │   ├── soporte/contactanos/  # Información institucional y contacto
│   │   └── usuario/              # Ajustes y notificaciones del usuario
│   ├── inicio/                   # Landing page del sistema
│   ├── service/                  # Servicios (autenticación, modo oscuro)
│   ├── app.routes.ts             # Definición de rutas
│   └── app.config.ts             # Configuración de la aplicación
└── styles.css

backend/
├── server.js                # Servidor Express y endpoints
├── usuarios.service.js      # Lógica de usuarios (registro, login, recuperación)
├── email.service.js         # Envío de correos (bienvenida y recuperación)
└── usuarios_db.json         # Base de datos local de usuarios
```

## 🚀 Instalación

```bash
# Clonar el repositorio
git clone <url-del-repositorio>
cd sana-uranus-data

# Instalar dependencias
npm install
```

Crear el archivo .env en la raíz del proyecto con el contenido:

```bash
GMAIL_USER=tu_correo_real@gmail.com 
GMAIL_APP_PASSWORD=tus16letrasdeaplicaciondegoogle
```
## ▶️ Ejecución

**Frontend (Angular)**

```bash
npm start
```

La aplicación quedará disponible en `http://localhost:4200`.

**Backend (Node/Express)**

```bash
cd backend
node backend/server.js
```

El servidor quedará disponible en `http://localhost:3000`.

## 🔑 Roles y Acceso

| Rol | Funcionalidades principales |
| --- | --- |
| Docente | Crear, consultar y editar reservas |
| Técnico | Ver inventario, gestionar reservas y mantenimientos |
| Gerente | Gestión de usuarios, inventario y mantenimientos |


## 👥 Autores

- Juan Diego Medina Mahecha
- Sofia Avila Martinez
- Juan David Bernal Torres
- Juan Camilo Aguirre Rojas

---
SENA - Sistema Integrado de Gestión
