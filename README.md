![Logo de UranusData](public/logo-largo-color.svg)


UranusData es una plataforma centralizada que permite digitalizar y automatizar los procesos de control de inventario. El sistema facilita la trazabilidad de los equipos registrados, gestionando su ciclo de vida a través de módulos especializados para reservas, préstamos y seguimiento de mantenimientos preventivos o correctivos. 

El proyecto está construido bajo una arquitectura separada:
- **Frontend:** Desarrollado con el framework Angular, encargado de la interfaz gráfica y la experiencia del usuario.
- **Backend:** Construido con Laravel (PHP), funciona como una API RESTful que procesa la lógica de negocio y gestiona la base de datos MySQL.

---

##  Documentación del Proyecto

Consulta nuestras guías detalladas para levantar el entorno y consumir la API:

* 🐳 [Guía de Instalación con Docker](./instalacion_docker.md)
* 🐘 [Guía de Instalación con XAMPP](./instalacion_xampp.md)
* 📖 [Documentación completa de la API REST](./DOCUMENTATION.md)
* ⚙️ [Notas técnicas del Backend](./README_BACKEND.md)

## 🔑 Roles y Funcionalidades

| Rol | Funcionalidades principales |
| --- | --- |
| Docente | Crear, consultar y editar reservas |
| Técnico | Ver inventario, gestionar reservas y mantenimientos |
| Gerente | Gestión de usuarios, inventario y mantenimientos |

## 👤 Credenciales de Prueba

| Documento | Nombre | Rol | Contraseña |
| --- | --- | --- | --- |
| 1234567890 | Juan Diego Medina Mahecha | Docente | 1234567890 |
| 1234567891 | Juan Diego Medina Mahecha | Técnico | 1234567890 |
| 1234567892 | Juan Diego Medina Mahecha | Gerente | 1234567890 |

## 📧 Características

- ✅ Autenticación con hash Bcrypt
- ✅ Notificaciones por correo
- ✅ Modo claro/oscuro
- ✅ Gestión de sesiones
- ✅ API RESTful con Laravel
- ✅ Edición de perfiles con validación

## 🔐 Seguridad

- Contraseñas hasheadas con Bcrypt
- Guards de autenticación en rutas
- Validación CSRF en formularios
- CORS configurado
- Validación en servidor y cliente

## 🚀 Cómo empezar
UranusData soporta dos entornos de ejecución. Elige el de tu preferencia:
* 🐳 [Guía de Instalación con Docker (Recomendado)](./instalacion_docker.md)
* 🐘 [Guía de Instalación con XAMPP](./instalacion_xampp.md)

## 👥 Autores

- Juan Diego Medina Mahecha
- Sofia Avila Martinez
- Juan David Bernal Torres
- Juan Camilo Aguirre Rojas

## 📄 Licencia

Proyecto académico para SENA - Sistema Integrado de Gestión
