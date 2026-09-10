<div class="email-container">
    <div class="email-header">
        <h2 class="email-title">Verifica tu correo</h2>
    </div>
    
    <div class="email-body">
        <p class="email-greeting">Hola <strong>{{ $nombre }}</strong>,</p>
        
        <p class="email-message">
            Se ha solicitado una verificación de tu correo electrónico. Este es un paso importante para asegurar tu cuenta.
        </p>
        
        <div class="email-highlight">
            <p>Código de verificación:</p>
            <p class="email-code">{{ $verification_code ?? 'N/A' }}</p>
        </div>
    </div>
    
    <div class="email-footer">
        <p>© 2026 UranusData - Institución Educativa Santa Isabel de Hungría</p>
    </div>
</div>