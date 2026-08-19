<?php

use Illuminate\Support\Facades\Route;
use Illuminate\Support\Facades\DB;

// Ruta principal / Inicio
Route::get('/', function () { return view('welcome'); });
Route::get('/inicio', function () { return view('welcome'); });

//    
// RUTAS GET (Para consultar y mostrar las tablas)
//    

Route::get('/rol', function () {
    $roles = DB::table('rol')->get();
    return view('rol', compact('roles'));
});

Route::get('/usuario', function () {
    $usuarios = DB::table('usuario')->get();
    return view('usuario', compact('usuarios'));
});

Route::get('/correo', function () {
    $correos = DB::table('correo')->get();
    return view('correo', compact('correos'));
});

Route::get('/telefono', function () {
    $telefonos = DB::table('telefono')->get();
    return view('telefono', compact('telefonos'));
});

Route::get('/estado_elemento', function () {
    $estadosElemento = DB::table('estado_elemento')->get();
    return view('estado_elemento', compact('estadosElemento'));
});

Route::get('/tipo_elemento', function () {
    $tiposElemento = DB::table('tipo_elemento')->get();
    return view('tipo_elemento', compact('tiposElemento'));
});

Route::get('/ubi_elemento', function () {
    $ubicaciones = DB::table('ubi_elemento')->get();
    return view('ubi_elemento', compact('ubicaciones'));
});

Route::get('/inventario', function () {
    $inventarios = DB::table('inventario')->get();
    return view('inventario', compact('inventarios'));
});

Route::get('/tipo_mantenimiento', function () {
    $tiposMantenimiento = DB::table('tipo_mantenimiento')->get();
    return view('tipo_mantenimiento', compact('tiposMantenimiento'));
});

Route::get('/mantenimiento', function () {
    $mantenimientos = DB::table('mantenimiento')->get();
    return view('mantenimiento', compact('mantenimientos'));
});

Route::get('/estado_reserva', function () {
    $estadosReserva = DB::table('estado_Reserva')->get();
    return view('estado_reserva', compact('estadosReserva'));
});

Route::get('/reserva', function () {
    $reservas = DB::table('Reserva')->get();
    return view('reserva', compact('reservas'));
});

Route::get('/prestamo', function () {
    $prestamos = DB::table('prestamo')->get();
    return view('prestamo', compact('prestamos'));
});

Route::get('/cantidad', function () {
    $cantidades = DB::table('cantidad')->get();
    return view('cantidad', compact('cantidades'));
});

//    
// RUTAS POST (Ejemplos para guardar nuevos registros)
//    

Route::post('/rol', function (\Illuminate\Http\Request $request) {
    DB::table('rol')->insert($request->except('_token'));
    return redirect('/rol');
});

Route::post('/usuario', function (\Illuminate\Http\Request $request) {
    DB::table('usuario')->insert($request->except('_token'));
    return redirect('/usuario');
});

Route::post('/correo', function (\Illuminate\Http\Request $request) {
    DB::table('correo')->insert($request->except('_token'));
    return redirect('/correo');
});

Route::post('/telefono', function (\Illuminate\Http\Request $request) {
    DB::table('telefono')->insert($request->except('_token'));
    return redirect('/telefono');
});

Route::post('/estado_elemento', function (\Illuminate\Http\Request $request) {
    DB::table('estado_elemento')->insert($request->except('_token'));
    return redirect('/estado_elemento');
});

Route::post('/tipo_elemento', function (\Illuminate\Http\Request $request) {
    DB::table('tipo_elemento')->insert($request->except('_token'));
    return redirect('/tipo_elemento');
});

Route::post('/ubi_elemento', function (\Illuminate\Http\Request $request) {
    DB::table('ubi_elemento')->insert($request->except('_token'));
    return redirect('/ubi_elemento');
});

Route::post('/inventario', function (\Illuminate\Http\Request $request) {
    DB::table('inventario')->insert($request->except('_token'));
    return redirect('/inventario');
});

Route::post('/tipo_mantenimiento', function (\Illuminate\Http\Request $request) {
    DB::table('tipo_mantenimiento')->insert($request->except('_token'));
    return redirect('/tipo_mantenimiento');
});

Route::post('/mantenimiento', function (\Illuminate\Http\Request $request) {
    DB::table('mantenimiento')->insert($request->except('_token'));
    return redirect('/mantenimiento');
});

Route::post('/estado_reserva', function (\Illuminate\Http\Request $request) {
    DB::table('estado_Reserva')->insert($request->except('_token'));
    return redirect('/estado_reserva');
});

Route::post('/reserva', function (\Illuminate\Http\Request $request) {
    DB::table('Reserva')->insert($request->except('_token'));
    return redirect('/reserva');
});

Route::post('/prestamo', function (\Illuminate\Http\Request $request) {
    DB::table('prestamo')->insert($request->except('_token'));
    return redirect('/prestamo');
});

Route::post('/cantidad', function (\Illuminate\Http\Request $request) {
    DB::table('cantidad')->insert($request->except('_token'));
    return redirect('/cantidad');
});