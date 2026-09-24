<!DOCTYPE html>
<html lang="es">
<head>
    <meta charset="UTF-8">
    <style>
        body { font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif; background-color: #f8fafc; margin: 0; padding: 40px 20px; color: #334155; }
        .email-container { max-width: 600px; margin: 0 auto; background-color: #ffffff; border-radius: 12px; overflow: hidden; box-shadow: 0 10px 25px rgba(0,0,0,0.05); border: 1px solid #e2e8f0; }
        .email-header { background-color: #1C74A0; padding: 25px 30px; text-align: center; border-bottom: 4px solid #fafafa; }
        .email-header h2 { margin: 0; color: #ffffff; font-size: 24px; font-weight: 700; letter-spacing: 0.5px; }
        .email-body { padding: 35px 30px; }
        .email-greeting { font-size: 16px; margin-top: 0; color: #1e293b; }
        .highlight-box { background-color: #f1f5f9; border-left: 4px solid #1C74A0; padding: 15px 20px; margin: 20px 0; border-radius: 0 8px 8px 0; }
        .highlight-box p { margin: 5px 0; font-size: 15px; }
        .email-message { font-size: 15px; line-height: 1.7; color: #475569; margin-bottom: 0; }
        .email-footer { background-color: #f8fafc; padding: 20px 30px; text-align: center; border-top: 1px solid #e2e8f0; font-size: 13px; color: #94a3b8; }
    </style>
</head>
<body>
    <div class="email-container">
        <div class="email-header">
            <h2>Nuevo Reporte de Soporte</h2>
        </div>
        
        <div class="email-body">
            <p class="email-greeting">Se ha generado un nuevo ticket de soporte en <strong>UranusData</strong>.</p>
            
            <div class="highlight-box">
                <p><strong>De:</strong> {{ $nombre }}</p>
                <p><strong>Documento:</strong> {{ $documento }}</p>
                <p><strong>Rol:</strong> <span style="color: #FF9F13; font-weight: bold;">{{ $rol }}</span></p>
                <p style="margin-top: 15px;"><strong>Asunto:</strong> {{ $asunto }}</p>
            </div>
            
            <p class="email-message"><strong>Descripción del problema:</strong><br>{{ $descripcion }}</p>
        </div>
        
        <div class="email-footer">
            <p>© 2026 UranusData - Institución Educativa Santa Isabel de Hungría</p>
        </div>
    </div>
</body>
</html>