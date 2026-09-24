<!DOCTYPE html>
<html lang="es">
<head>
    <meta charset="UTF-8">
    <style>
        body { font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif; background-color: #f8fafc; margin: 0; padding: 40px 20px; color: #334155; }
        .email-container { max-width: 600px; margin: 0 auto; background-color: #ffffff; border-radius: 12px; overflow: hidden; box-shadow: 0 10px 25px rgba(0,0,0,0.05); border: 1px solid #e2e8f0; }
        .email-header { background-color: #1C74A0; padding: 25px 30px; text-align: center; border-bottom: 4px solid #FF9F13; }
        .email-header h2 { margin: 0; color: #ffffff; font-size: 24px; font-weight: 700; }
        .email-body { padding: 35px 30px; text-align: center; }
        .email-message { font-size: 16px; line-height: 1.6; color: #475569; margin-bottom: 25px; }
        .btn-primary { display: inline-block; background-color: #FF9F13; color: #ffffff !important; text-decoration: none; padding: 14px 30px; border-radius: 8px; font-weight: bold; font-size: 16px; margin: 10px 0 25px 0; }
        .email-code { background-color: #f1f5f9; padding: 12px; border-radius: 6px; font-family: monospace; font-size: 12px; color: #1C74A0; word-break: break-all; text-align: left; }
        .email-warning { background-color: #fffbeb; border-left: 4px solid #fbbf24; padding: 15px; margin-top: 30px; font-size: 13px; color: #b45309; text-align: left; }
        .email-footer { background-color: #f8fafc; padding: 20px 30px; text-align: center; border-top: 1px solid #e2e8f0; font-size: 13px; color: #94a3b8; }
    </style>
</head>
<body>
    <div class="email-container">
        <div class="email-header">
            <h2>Recuperar Contraseña</h2>
        </div>
        
        <div class="email-body">
            <p class="email-message">Hola <strong>{{ $nombre }}</strong>,<br><br>Recibimos una solicitud para recuperar tu contraseña en UranusData. Haz clic en el botón de abajo para establecer una nueva.</p>
            
            <a href="{{ $enlace }}" class="btn-primary">🔐 Restablecer Contraseña</a>
            
            <p style="font-size: 14px; color: #64748b;">Este enlace expira en <strong>1 hora</strong>. Si el botón no funciona, copia y pega este enlace en tu navegador:</p>
            <div class="email-code">{{ $enlace }}</div>

            <div class="email-warning">
                <strong>⚠️ Seguridad:</strong> Si no solicitaste este cambio, ignora este correo. Tu cuenta sigue siendo segura.
            </div>
        </div>
        
        <div class="email-footer">
            <p>© 2026 UranusData - Institución Educativa Santa Isabel de Hungría</p>
        </div>
    </div>
</body>
</html>