<?php

use Illuminate\Http\Request;
use Illuminate\Support\Facades\Route;
use App\Http\Controllers\AuthController;
use App\Http\Controllers\UbiElementoController;
use App\Http\Controllers\ProfileController;
use App\Http\Controllers\UsuarioGestorController;
use App\Http\Controllers\ReservaUsuarioController;
use App\Http\Controllers\ReservaController;
use App\Http\Controllers\InventarioController;
use App\Http\Controllers\MantenimientoController;
use App\Http\Controllers\RecuperarContrasenadController;
use App\Http\Controllers\TipoElementoController;
use App\Http\Controllers\InventarioAccesorioController;
use App\Http\Controllers\HistorialBajasController;
use App\Http\Controllers\ContactoController;
use App\Http\Controllers\DashboardController;
use App\Http\Controllers\SearchController;
use App\Http\Controllers\ConfiguracionUsuarioController;

// AUTH 
Route::post('/login', [AuthController::class, 'login'])->middleware('throttle:5,1');
Route::post('/activar/validar', [AuthController::class, 'validarActivacion']);
Route::post('/activar/cuenta', [AuthController::class, 'activarCuenta']);
Route::post('/recuperar-contrasena/solicitar', [RecuperarContrasenadController::class, 'solicitarRecuperacion'])->middleware('throttle:5,1');
Route::get('/recuperar-contrasena/verificar/{token}', [RecuperarContrasenadController::class, 'verificarToken'])->middleware('throttle:10,1');
Route::post('/recuperar-contrasena/confirmar', [RecuperarContrasenadController::class, 'confirmarRecuperacion'])->middleware('throttle:5,1');


// Rutas protegidas por Sanctum
Route::middleware(['auth:sanctum'])->group(function () {

    Route::post('/register', [AuthController::class, 'register'])->middleware('role:Gerente');

    // LOGOUT  
    Route::post('/logout', [AuthController::class, 'logout']);

    // PERFIL  
    Route::get('/perfil/{documento}', [ProfileController::class, 'obtenerPerfil']);
    Route::put('/perfil/{documento}', [ProfileController::class, 'actualizarPerfil']);

    // SOPORTE / CONTACTO
    Route::post('/contacto/enviar', [ContactoController::class, 'enviarMensaje']);

    // GESTIÓN DE USUARIO (Gerente y Técnico)  
    Route::middleware(['auth:sanctum', 'role:Gerente,Tecnico'])->group(function () {
        Route::get('/gestion/usuario/estados/list', [UsuarioGestorController::class, 'listarEstados']);
        Route::get('/gestion/usuario/rol/list', [UsuarioGestorController::class, 'listarrol']);
        Route::get('/gestion/usuario/prestamos-activos', [UsuarioGestorController::class, 'obtenerPrestamosActivos']);
        Route::put('/gestion/usuario/prestamos-activos/{id}', [UsuarioGestorController::class, 'actualizarEstadoPrestamo']);
        Route::get('/gestion/usuario/prestamos-activos/exportar', [UsuarioGestorController::class, 'exportarPrestamos']);
        Route::delete('/ubicaciones/{id}', [UbiElementoController::class, 'destroy']);

        Route::apiResource('gestion/usuario', UsuarioGestorController::class);
    });

    // RESERVAS DEL USUARIO ACTUAL  
    Route::get('/mis-reserva', [ReservaUsuarioController::class, 'obtenerMisReservas']);
    Route::post('/mis-reserva', [ReservaUsuarioController::class, 'crearReserva']);
    Route::put('/mis-reserva/{id}', [ReservaUsuarioController::class, 'actualizarReserva']);
    Route::delete('/mis-reserva/{id}', [ReservaUsuarioController::class, 'cancelarReserva']);
    Route::get('/reservas/estados', [ReservaUsuarioController::class, 'estadosReserva']);
    Route::get('/reservas/usuario/{documento}', [ReservaUsuarioController::class, 'historialUsuario']);

    // RESERVAS GENERALES Y PRÉSTAMOS (Gerente/Técnico)  
    Route::middleware(['role:Gerente,Tecnico'])->group(function () {
        // Nuevas rutas para el flujo de entregas y devoluciones parciales
        Route::post('/reserva/{id}/entregar', [ReservaController::class, 'entregarPrestamo']);
        Route::post('/prestamo/detalles/{idDetalle}/devolver-parcial', [ReservaController::class, 'devolverParcial']);
        
        Route::apiResource('reserva', ReservaController::class);

        Route::post('/inventario-accesorios/trasladar', [InventarioAccesorioController::class, 'trasladar']);
        Route::apiResource('inventario-accesorios', InventarioAccesorioController::class);
    });

    // INVENTARIO (Gerente/Técnico)  
    Route::middleware(['role:Gerente,Tecnico'])->group(function () {
        Route::get('/inventario/opciones', [InventarioController::class, 'getOpciones']);
        Route::get('/inventario/elementos-tipo/{tipo}', [InventarioController::class, 'obtenerElementosPorTipo']);
        Route::get('/inventario/exportar', [InventarioController::class, 'exportarInventario']);
        
        // --- COLOCA ESTAS RUTAS AQUÍ ARRIBA (ANTES de apiResource) ---
        Route::get('/inventario/historial-bajas-general', [HistorialBajasController::class, 'index']);
        Route::post('/inventario/historial-bajas-general/{id}/restaurar', [HistorialBajasController::class, 'restaurar']);
        Route::patch('/inventario/activos/{id}/dar-de-baja', [HistorialBajasController::class, 'darDeBajaActivo']);
        Route::post('/inventario/accesorios/{id}/dar-de-baja', [HistorialBajasController::class, 'darDeBajaAccesorio']);

        Route::post('/inventario/{id}/mantenimiento', [InventarioController::class, 'enviarMantenimiento']);
        Route::get('/inventario/{id}/historial', [App\Http\Controllers\InventarioController::class, 'historial']);
        Route::post('/ubicaciones', [UbiElementoController::class, 'store']);
        
        Route::post('/tipos-elemento', [TipoElementoController::class, 'store']);
        Route::put('/tipos-elemento/{id}', [TipoElementoController::class, 'update']);
        Route::delete('/tipos-elemento/{id}', [TipoElementoController::class, 'destroy']);
        
        // El apiResource siempre debe ir debajo de las rutas fijas/personalizadas
        Route::apiResource('inventario', InventarioController::class);
    });

    // MANTENIMIENTO (Gerente/Técnico)
    Route::middleware(['role:Gerente,Tecnico'])->group(function () {
        Route::get('/mantenimiento/opciones', [MantenimientoController::class, 'getOpciones']);
        Route::get('/mantenimiento/tipos/list', [MantenimientoController::class, 'getTipos']); 
        Route::get('/mantenimiento/activos', [MantenimientoController::class, 'obtenerMantenimientosActivos']);
        Route::put('/mantenimiento/{id}/completar', [MantenimientoController::class, 'completarMantenimiento']);
        
        Route::apiResource('mantenimiento', MantenimientoController::class);
    });

    // DASHBOARD
    Route::prefix('dashboard')->group(function () {
        Route::get('/resumen', [DashboardController::class, 'resumen']);
        Route::get('/estadisticas', [DashboardController::class, 'estadisticas']);
        Route::get('/alertas', [DashboardController::class, 'alertas']);
    });

    // BÚSQUEDA GLOBAL
    Route::get('/buscar', [SearchController::class, 'global']);

    // CONFIGURACIÓN (AJUSTES Y NOTIFICACIONES)
    Route::get('/ajustes', [ConfiguracionUsuarioController::class, 'obtenerAjustes']);
    Route::put('/ajustes', [ConfiguracionUsuarioController::class, 'actualizarAjustes']);
    Route::get('/notificaciones', [ConfiguracionUsuarioController::class, 'obtenerNotificaciones']);
    Route::put('/notificaciones/{id}/leer', [ConfiguracionUsuarioController::class, 'marcarNotificacionLeida']);

});