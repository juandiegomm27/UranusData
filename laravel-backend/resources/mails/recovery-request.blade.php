<div class="email-container">
    <div class="email-header">
        <h2 class="email-title">Recuperar Contraseña</h2>
    </div>
    
    <div class="email-body">
        <p class="email-greeting">Hola <strong>{{ $nombre }}</strong>,</p>
        
        <p class="email-message">
            Recibimos una solicitud para recuperar tu contraseña en UranusData. 
            Haz clic en el botón de abajo para establecer una nueva contraseña.
        </p>
        
        <div class="email-highlight">
            <p>Este enlace expira en <strong>1 hora</strong>.</p>
            <a href="{{ $enlace }}" class="email-cta" style="display: inline-block; background-color: #1C74A0; color: #fff; padding: 12px 24px; border-radius: 6px; text-decoration: none; font-weight: 600;">🔐 Recuperar Contraseña</a>
        </div>

        <p class="email-message">
            O copia y pega este enlace en tu navegador:
        </p>
        
        <div class="email-code">{{ $enlace }}</div>
    </div>
    
    <div class="email-warning">
        <p><strong>⚠️ Seguridad:</strong> Si no solicitaste este cambio, ignora este email. Tu cuenta es segura.</p>
    </div>
    
    <div class="email-footer">
        <p>© 2026 UranusData - Institución Educativa Santa Isabel de Hungría</p>
    </div>
</div>