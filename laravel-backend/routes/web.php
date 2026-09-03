<?php

use Illuminate\Support\Facades\Route;

/**
 * WEB ROUTES - SOLO DOCUMENTACIÓN+
 * Este archivo contiene SOLO rutas públicas de documentación.
 * TODAS las funciones API están en routes/api.php
 */

// Ruta raíz - Info de la API
Route::get('/', function () {
    return response()->json([
        'nombre' => 'UranusData API',
        'versión' => '1.0.0',
        'descripción' => 'API REST para gestión de equipos, préstamos y reserva',
        'endpoints_base' => url('/api'),
        'documentación' => url('/docs'),
        'estado' => 'operativo'
    ]);
});

// Health Check (para monitoreo/verificar que la API está viva)
// Se excluyen los middleware que necesitan sesión o errores compartidos para que
// este endpoint siga respondiendo aunque la BD o la tabla de sesiones no estén disponibles.
Route::withoutMiddleware([
    \Illuminate\Session\Middleware\StartSession::class,
    \Illuminate\View\Middleware\ShareErrorsFromSession::class,
    \Illuminate\Foundation\Http\Middleware\VerifyCsrfToken::class,
])->get('/health', function () {
    return response()->json([
        'status' => 'ok',
        'timestamp' => now()->toIso8601String(),
    ]);
});

// Página de documentación (solo en desarrollo)
if (config('app.env') === 'local' || config('app.debug')) {
    Route::get('/docs', function () {
        return <<<'HTML'
        <!DOCTYPE html>
        <html>
        <head>
            <meta charset="UTF-8">
            <title>UranusData API - Documentación</title>
            <style>
                body { font-family: Arial; margin: 40px; background: #f5f5f5; }
                h1 { color: #1C74A0; }
                .doc { background: white; padding: 20px; border-radius: 8px; margin: 20px 0; }
                code { background: #eee; padding: 2px 6px; border-radius: 3px; }
            </style>
        </head>
        <body>
            <h1>📚 UranusData API - Documentación</h1>
            <div class="doc">
                <h2>Base URL</h2>
                <code>http://localhost:8000/api</code>
            </div>
            <div class="doc">
                <h2>Autenticación</h2>
                <p><code>Authorization: Bearer {token}</code></p>
            </div>
            <div class="doc">
                <h2>Endpoints Principales</h2>
                <ul>
                    <li><code>POST /api/login</code> - Iniciar sesión</li>
                    <li><code>POST /api/logout</code> - Cerrar sesión</li>
                    <li><code>GET /api/gestion/usuario</code> - Listar usuario</li>
                    <li><code>GET /api/gestion/usuario/prestamos-activos</code> - Listar préstamos</li>
                    <li><code>GET /api/perfil/{documento}</code> - Obtener perfil</li>
                </ul>
            </div>
            <p><a href="/api">Ver respuesta JSON de API →</a></p>
        </body>
        </html>
        HTML;
    });
}