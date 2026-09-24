<!DOCTYPE html>
<html lang="es">
<head>
    <meta charset="UTF-8">
    <style>
        body { font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif; background-color: #f8fafc; margin: 0; padding: 40px 20px; color: #334155; }
        .email-container { max-width: 600px; margin: 0 auto; background-color: #ffffff; border-radius: 12px; overflow: hidden; box-shadow: 0 10px 25px rgba(0,0,0,0.05); border: 1px solid #e2e8f0; }
        .email-header { background-color: #1C74A0; padding: 25px 30px; text-align: center; border-bottom: 4px solid #FF9F13; }
        .email-header h2 { margin: 0; color: #ffffff; font-size: 24px; font-weight: 700; }
        .email-body { padding: 35px 30px; }
        .email-message { font-size: 16px; line-height: 1.6; color: #475569; margin-bottom: 20px; }
        .success-box { background-color: #f0fdf4; border: 1px solid #bbf7d0; padding: 15px; border-radius: 8px; color: #166534; text-align: center; font-weight: bold; margin-bottom: 25px; }
        .email-warning { background-color: #fffbeb; border-left: 4px solid #fbbf24; padding: 15px; font-size: 13px; color: #b45309; }
        .email-footer { background-color: #f8fafc; padding: 20px 30px; text-align: center; border-top: 1px solid #e2e8f0; font-size: 13px; color: #94a3b8; }
    </style>
</head>
<body>
    <div class="email-container">
        <div class="email-header">
            <h2>Actualización de Perfil</h2>
        </div>
        
        <div class="email-body">
            <p class="email-message">Hola <strong>{{ $nombre }}</strong>,</p>
            
            <div class="success-box">
                ✅ Tu información de perfil ha sido actualizada correctamente en UranusData.
            </div>

            <div class="email-warning">
                <strong>⚠️ Aviso:</strong> Si no realizaste esta acción, contacta inmediatamente con el administrador del sistema.
            </div>
        </div>
        
        <div class="email-footer">
            <p>© 2026 UranusData - Institución Educativa Santa Isabel de Hungría</p>
        </div>
    </div>
</body>
</html>