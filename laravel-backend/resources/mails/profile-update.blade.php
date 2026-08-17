<!DOCTYPE html>
<html lang="es">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <link rel="stylesheet" href="{{ asset('css/mail-styles.css') }}">
</head>
<body>
  <div class="email-container">
    
    <div class="email-header">
      <h2 class="email-title">¡Tu Perfil ha sido Actualizado!</h2>
      <p class="email-subtitle">UranusData - Sistema de Gestión</p>
    </div>

    <div class="email-body">
      <p>Hola <strong>{{ $nombre }}</strong>,</p>
      
      <p>Tu información de perfil en <strong>UranusData</strong> ha sido actualizada correctamente.</p>

      <div class="email-highlight">
        <strong>Cambios realizados:</strong>
        <ul>
          <li><strong>Nombre:</strong> {{ $nombre }} {{ $apellido }}</li>
          <li><strong>Correo:</strong> {{ $correo }}</li>
          <li><strong>Teléfono:</strong> {{ $phone ?? 'No especificado' }}</li>
          <li><strong>Rol:</strong> {{ $rol }}</li>
        </ul>
      </div>

      <div class="email-warning">
        ⚠️ Si no realizaste estos cambios, contacta inmediatamente al administrador.
      </div>
    </div>

    <div class="email-footer">
      <p>© 2026 UranusData - I.E. Santa Isabel de Hungría</p>
      <p>Todos los derechos reservados | Acceso exclusivo para personal autorizado</p>
    </div>

  </div>
</body>
</html>