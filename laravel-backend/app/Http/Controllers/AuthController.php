<?php

namespace App\Http\Controllers;

use App\Models\Usuario;
use App\Models\Correo;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Hash;

class AuthController extends Controller
{
    public function login(Request $request)
    {
        $validated = $request->validate([
            'documento' => 'required',
            'password' => 'required'
        ]);

        $usuario = Usuario::with('rol')->find($validated['documento']);

        if (!$usuario || !Hash::check($validated['password'], $usuario->password ?? '')) {
            return response()->json(['status' => 'error', 'mensaje' => 'Credenciales incorrectas'], 401);
        }

        return response()->json([
            'status' => 'success',
            'mensaje' => 'Acceso concedido',
            'usuario' => [
                'documento' => $usuario->documento,
                'nombre' => $usuario->nombre,
                'apellido' => $usuario->apellido,
                'rol' => $usuario->rol->cargo
            ]
        ]);
    }

    public function register(Request $request)
    {
        $validated = $request->validate([
            'rol' => 'required|exists:rol,cargo',
            'primerNombre' => 'required|string',
            'apellidos' => 'required|string',
            'documento' => 'required|unique:usuario',
            'correo' => 'required|email|unique:correo',
            'password' => 'required|min:6|confirmed'
        ]);

        $rol = \App\Models\Rol::where('cargo', $validated['rol'])->first();

        $usuario = Usuario::create([
            'documento' => $validated['documento'],
            'nombre' => $validated['primerNombre'],
            'apellido' => $validated['apellidos'],
            'cod_rol' => $rol->cod_rol,
            'password' => Hash::make($validated['password'])
        ]);

        Correo::create([
            'correo' => $validated['correo'],
            'documento' => $usuario->documento
        ]);

        return response()->json(['status' => 'success', 'mensaje' => 'Usuario registrado correctamente'], 201);
    }
}