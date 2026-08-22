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

        $usuario = Usuario::with(['rol', 'estadoUsuario', 'correos', 'telefonos'])
            ->find($validated['documento']);

        if (!$usuario || !Hash::check($validated['password'], $usuario->password ?? '')) {
            return response()->json(['status' => 'error', 'mensaje' => 'Credenciales incorrectas'], 401);
        }

        if ($usuario->cod_estado_usuario != 1) {
            return response()->json([
                'status' => 'error',
                'mensaje' => 'Usuario inactivo o bloqueado. Contacta al administrador.'
            ], 403);
        }
        return response()->json([
            'status' => 'success',
            'mensaje' => 'Acceso concedido',
            'usuario' => [
                'documento' => $usuario->documento,
                'nombre' => $usuario->nombre,
                'apellido' => $usuario->apellido,
                'rol' => $usuario->rol->cargo,
                'correo' => $usuario->correos->first()?->correo ?? '',
                'telefono' => $usuario->telefonos->first()?->telefono ?? '',
                'estado' => $usuario->estadoUsuario?->estado ?? ''
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

    public function validarUsuarioActivar(Request $request)
    {
        $validated = $request->validate([
            'primerNombre' => 'required|string',
            'apellidos' => 'required|string',
            'documento' => 'required',
            'correo' => 'required|email',
            'rol' => 'required|exists:rol,cod_rol'
        ]);

        $usuario = Usuario::where('documento', $validated['documento'])
            ->where('nombre', $validated['primerNombre'])
            ->where('apellido', $validated['apellidos'])
            ->where('cod_rol', $validated['rol'])
            ->whereHas('correos', function ($query) use ($validated) {
                $query->where('correo', $validated['correo']);
            })
            ->first();

        if (!$usuario) {
            return response()->json([
                'status' => 'error',
                'mensaje' => 'Los datos ingresados no coinciden con nuestros registros.'
            ], 404);
        }

        return response()->json([
            'status' => 'success',
            'cod_estado_usuario' => $usuario->cod_estado_usuario,
            'estado' => $usuario->estadoUsuario?->estado
        ]);
    }

    public function activarCuenta(Request $request)
    {
        $validated = $request->validate([
            'primerNombre' => 'required|string',
            'apellidos' => 'required|string',
            'documento' => 'required',
            'correo' => 'required|email',
            'rol' => 'required|exists:rol,cod_rol',
            'password' => 'required|string|min:6',
            'cod_estado_usuario' => 'required|in:1'
        ]);

        $usuario = Usuario::where('documento', $validated['documento'])
            ->where('nombre', $validated['primerNombre'])
            ->where('apellido', $validated['apellidos'])
            ->where('cod_rol', $validated['rol'])
            ->whereHas('correos', function ($query) use ($validated) {
                $query->where('correo', $validated['correo']);
            })
            ->first();

        if (!$usuario) {
            return response()->json(['status' => 'error', 'mensaje' => 'Usuario no encontrado'], 404);
        }

        if ($usuario->cod_estado_usuario == 3) {
            return response()->json(['status' => 'error', 'mensaje' => 'La cuenta se encuentra bloqueada'], 403);
        }

        $usuario->update([
            'password' => Hash::make($validated['password']),
            'cod_estado_usuario' => 1
        ]);

        return response()->json(['status' => 'success', 'mensaje' => 'Cuenta activada correctamente']);
    }

    public function logout(Request $request)
    {
        session()->flush();

        return response()->json([
            'status' => 'success',
            'mensaje' => 'Sesión cerrada correctamente'
        ]);
    }
}