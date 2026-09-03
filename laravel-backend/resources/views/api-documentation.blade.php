<!DOCTYPE html>
<html lang="es">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>UranusData API - Documentación</title>
    <style>
        * { margin: 0; padding: 0; box-sizing: border-box; }
        body {
            font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif;
            background: linear-gradient(135deg, #1C74A0 0%, #0f4c73 100%);
            color: #333;
            line-height: 1.6;
        }
        .container {
            max-width: 1200px;
            margin: 0 auto;
            padding: 40px 20px;
        }
        header {
            text-align: center;
            color: white;
            margin-bottom: 50px;
        }
        header h1 {
            font-size: 2.5rem;
            margin-bottom: 10px;
        }
        header p {
            font-size: 1.1rem;
            opacity: 0.9;
        }
        .docs-grid {
            display: grid;
            grid-template-columns: repeat(auto-fit, minmax(300px, 1fr));
            gap: 20px;
            margin-bottom: 50px;
        }
        .doc-card {
            background: white;
            border-radius: 8px;
            padding: 30px;
            box-shadow: 0 10px 30px rgba(0, 0, 0, 0.2);
            transition: transform 0.3s;
        }
        .doc-card:hover {
            transform: translateY(-5px);
        }
        .doc-card h3 {
            color: #1C74A0;
            margin-bottom: 15px;
            font-size: 1.3rem;
        }
        .doc-card p {
            color: #666;
            margin-bottom: 15px;
        }
        .doc-card a {
            display: inline-block;
            background: #1C74A0;
            color: white;
            padding: 10px 20px;
            border-radius: 4px;
            text-decoration: none;
            transition: background 0.3s;
        }
        .doc-card a:hover {
            background: #0f4c73;
        }
        .info-section {
            background: white;
            border-radius: 8px;
            padding: 30px;
            margin-bottom: 30px;
        }
        .info-section h2 {
            color: #1C74A0;
            margin-bottom: 20px;
            border-bottom: 2px solid #1C74A0;
            padding-bottom: 10px;
        }
        .endpoint {
            background: #f9f9f9;
            padding: 15px;
            margin: 10px 0;
            border-left: 4px solid #FF9F13;
            border-radius: 4px;
            font-family: monospace;
            font-size: 0.9rem;
        }
        .method-get { color: #0066cc; font-weight: bold; }
        .method-post { color: #00cc00; font-weight: bold; }
        .method-put { color: #ff9900; font-weight: bold; }
        .method-delete { color: #cc0000; font-weight: bold; }
        .footer {
            text-align: center;
            color: white;
            margin-top: 50px;
            padding-top: 30px;
            border-top: 1px solid rgba(255, 255, 255, 0.2);
        }
    </style>
</head>
<body>
    <div class="container">
        <header>
            <h1>🚀 UranusData API</h1>
            <p>Documentación de la API REST</p>
        </header>

        <div class="docs-grid">
            <div class="doc-card">
                <h3>📚 Documentación Completa</h3>
                <p>Guía detallada de todos los endpoints, parámetros y respuestas.</p>
                <a href="/API_DOCUMENTATION.md" target="_blank">Leer documentación →</a>
            </div>
            <div class="doc-card">
                <h3>🔧 Instalación</h3>
                <p>Pasos para instalar y configurar el backend.</p>
                <a href="/INSTALACION.md" target="_blank">Instrucciones →</a>
            </div>
            <div class="doc-card">
                <h3>⚙️ Variables de Entorno</h3>
                <p>Configuración necesaria con el archivo .env</p>
                <a href="/.env.example" target="_blank">Ver .env.example →</a>
            </div>
        </div>

        <div class="info-section">
            <h2>📌 Base URL</h2>
            <p><strong>{{ url('/api') }}</strong></p>
        </div>

        <div class="info-section">
            <h2>🔐 Autenticación</h2>
            <p>Todos los endpoints (excepto login y register) requieren autenticación con Sanctum Bearer Token.</p>
            <p>
                <strong>Header requerido:</strong><br>
                <code>Authorization: Bearer {token}</code>
            </p>
        </div>

        <div class="info-section">
            <h2>📋 Endpoints Principales</h2>
            <div class="endpoint"><span class="method-post">POST</span> /api/login</div>
            <div class="endpoint"><span class="method-post">POST</span> /api/register</div>
            <div class="endpoint"><span class="method-post">POST</span> /api/logout</div>
            <div class="endpoint"><span class="method-get">GET</span> /api/gestion/usuario</div>
            <div class="endpoint"><span class="method-get">GET</span> /api/gestion/usuario/prestamos-activos</div>
            <div class="endpoint"><span class="method-get">GET</span> /api/perfil/{documento}</div>
            <div class="endpoint"><span class="method-put">PUT</span> /api/perfil/{documento}</div>
        </div>

        <div class="info-section">
            <h2>✅ Status</h2>
            <p>API Status: <strong style="color: green;">🟢 Operativo</strong></p>
            <p>Versión: <strong>1.0.0</strong></p>
            <p>Último actualizado: <strong>{{ date('Y-m-d H:i:s') }}</strong></p>
        </div>

        <div class="footer">
            <p>© 2026 UranusData - Institución Educativa Santa Isabel de Hungría</p>
            <p>Backend desarrollado con Laravel 12 + Sanctum</p>
        </div>
    </div>
</body>
</html>