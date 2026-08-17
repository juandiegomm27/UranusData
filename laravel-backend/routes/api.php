<?php

use Illuminate\Http\Request;
use Illuminate\Support\Facades\Route;
use App\Http\Controllers\AuthController;
use App\Http\Controllers\UsuarioController;
use App\Http\Controllers\InventarioController;
use App\Http\Controllers\ReservaController;
use App\Http\Controllers\MantenimientoController;
use App\Http\Controllers\ProfileController;
use App\Http\Controllers\UsuarioGestorController;
use App\Http\Controllers\ReservaUsuarioController;

// Rutas públicas
Route::post('/login', [AuthController::class, 'login']);
Route::post('/register', [AuthController::class, 'register']);

// Rutas de perfil
Route::get('/perfil/{documento}', [ProfileController::class, 'getProfile']);
Route::put('/perfil/{documento}', [ProfileController::class, 'updateProfile']);

// Recursos API estándar
Route::apiResource('usuarios', UsuarioController::class);
Route::apiResource('inventario', InventarioController::class);
Route::apiResource('reservas', ReservaController::class);
Route::apiResource('mantenimientos', MantenimientoController::class);

// Gestión de Usuarios (para Gerente)
Route::prefix('gestion')->group(function () {
    Route::apiResource('usuarios', UsuarioGestorController::class);
    Route::get('/usuarios/estados/list', [UsuarioGestorController::class, 'estados']);
    Route::get('/usuarios/roles/list', [UsuarioGestorController::class, 'roles']);
});

// Historial de reservas por usuario
Route::get('/usuario/{documento}/reservas', [ReservaUsuarioController::class, 'historialUsuario']);
Route::get('/reservas/estados/list', [ReservaUsuarioController::class, 'estadosReserva']);