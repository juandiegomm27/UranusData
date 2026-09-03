<?php

use Illuminate\Http\Request;
use Illuminate\Support\Facades\Route;
use App\Http\Controllers\AuthController;
use App\Http\Controllers\ProfileController;
use App\Http\Controllers\UsuarioGestorController;
use App\Http\Controllers\ReservaUsuarioController;
use App\Http\Controllers\ReservaController;
use App\Http\Controllers\InventarioController;
use App\Http\Controllers\MantenimientoController;
use App\Http\Controllers\RecuperarContrasenadController;

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

    //   LOGOUT  
    Route::post('/logout', [AuthController::class, 'logout']);

    //   PERFIL  
    Route::get('/perfil/{documento}', [ProfileController::class, 'obtenerPerfil']);
    Route::put('/perfil/{documento}', [ProfileController::class, 'actualizarPerfil']);

    //   GESTIÓN DE usuario (Gerente y Técnico)  
    Route::middleware(['auth:sanctum', 'role:Gerente,Técnico'])->group(function () {

        // Rutas específicas ANTES de apiResource
        Route::get('/gestion/usuario/estados/list', [UsuarioGestorController::class, 'listarEstados']);
        Route::get('/gestion/usuario/rol/list', [UsuarioGestorController::class, 'listarrol']);
        Route::get('/gestion/usuario/prestamos-activos', [UsuarioGestorController::class, 'obtenerPrestamosActivos']);
        Route::put('/gestion/usuario/prestamos-activos/{id}', [UsuarioGestorController::class, 'actualizarEstadoPrestamo']);
        Route::get('/gestion/usuario/prestamos-activos/exportar', [UsuarioGestorController::class, 'exportarPrestamos']);

        // Recurso completo (CRUD de usuario)
        Route::apiResource('gestion/usuario', UsuarioGestorController::class);
    });

    //   reserva DEL USUARIO ACTUAL  
    Route::get('/mis-reserva', [ReservaUsuarioController::class, 'obtenerMisReservas']);
    Route::post('/mis-reserva', [ReservaUsuarioController::class, 'crearReserva']);
    Route::put('/mis-reserva/{id}', [ReservaUsuarioController::class, 'actualizarReserva']);
    Route::delete('/mis-reserva/{id}', [ReservaUsuarioController::class, 'cancelarReserva']);

    //   reserva GENERALES (Gerente/Técnico)  
    Route::middleware(['role:Gerente,Técnico'])->group(function () {
        Route::apiResource('reserva', ReservaController::class);
    });

    //   INVENTARIO (Gerente/Técnico)  
    Route::middleware(['role:Gerente,Técnico'])->group(function () {
        Route::get('/inventario/elementos-tipo/{tipo}', [InventarioController::class, 'obtenerElementosPorTipo']);
        Route::get('/inventario/exportar', [InventarioController::class, 'exportarInventario']);
        Route::apiResource('inventario', InventarioController::class);
    });

    // MANTENIMIENTO (Gerente/Técnico)
    Route::middleware(['role:Gerente,Técnico'])->group(function () {
        Route::get('/mantenimiento/activos', [MantenimientoController::class, 'obtenerMantenimientosActivos']);
        Route::put('/mantenimiento/{id}/completar', [MantenimientoController::class, 'completarMantenimiento']);
        Route::apiResource('mantenimiento', MantenimientoController::class);
    });

});
