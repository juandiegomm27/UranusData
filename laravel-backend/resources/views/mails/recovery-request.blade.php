<!DOCTYPE html>
<html lang="es">
<head>
    <meta charset="UTF-8">
    <title>{{ $subject ?? 'Recuperación de contraseña' }}</title>
</head>
<body>
    <h1>Recuperación de contraseña</h1>
    <p>Hola {{ $nombre }},</p>
    <p>Recibimos una solicitud para recuperar tu contraseña de UranusData.</p>
    <p>
        <a href="{{ $enlace }}">Restablecer contraseña</a>
    </p>
    <p>Este enlace es válido por una hora y solo puede utilizarse una vez.</p>
    <p>Si no solicitaste este cambio, puedes ignorar este correo.</p>
</body>
</html>
