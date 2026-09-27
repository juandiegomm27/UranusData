<?php

namespace App\Http\Controllers;

use App\Models\Usuario;
use App\Models\Rol;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Hash;
use Illuminate\Support\Facades\Cache;

class AuthController extends Controller
{
    private const MAX_INTENTOS = 5;
    private const TIEMPO_BLOQUEO = 900;

    public function login(Request $request)
    {
        $validated = $request->validate([
            'documento' => 'required|digits:10',
            'password' => 'required|string|min:6|max:15'
        ]);

        $documento = $validated['documento'];

        $intentos = Cache::get("login_intentos_{$documento}", 0);
        $bloqueadoHasta = Cache::get("login_bloqueado_{$documento}", 0);

        if ($intentos >= self::MAX_INTENTOS) {
            if (time() < $bloqueadoHasta) {
                $minutosRestantes = ceil(($bloqueadoHasta - time()) / 60);
                return response()->json([
                    'success' => false,
                    'mensaje' => "Demasiados intentos. Intenta de nuevo en {$minutosRestantes} minuto(s)"
                ], 429);
            } else {
                Cache::forget("login_intentos_{$documento}");
                Cache::forget("login_bloqueado_{$documento}");
                $intentos = 0;
            }
        }

        $usuario = Usuario::where('documento', $documento)->first();

        if (!$usuario || !Hash::check($validated['password'], $usuario->password)) {
            $intentos++;
            Cache::put("login_intentos_{$documento}", $intentos, self::TIEMPO_BLOQUEO);
            
            if ($intentos >= self::MAX_INTENTOS) {
                Cache::put("login_bloqueado_{$documento}", time() + self::TIEMPO_BLOQUEO, self::TIEMPO_BLOQUEO);
                
                if ($usuario) {
                    $usuario->tokens()->delete();
                }
            }
            return response()->json([
                'success' => false,
                'mensaje' => 'Credenciales inválidas'
            ], 401);
        }

        if ($usuario->cod_estado_usuario == 2) {
            return response()->json([
                'success' => false,
                'mensaje' => 'Tu usuario está inactivo. Por favor contacta al administrador'
            ], 403);
        }

        if ($usuario->cod_estado_usuario == 3) {
            return response()->json([
                'success' => false,
                'mensaje' => 'Tu usuario está bloqueado. Por favor comunícate con soporte'
            ], 403);
        }

        if ($usuario->cod_estado_usuario !== 1) {
            return response()->json([
                'success' => false,
                'mensaje' => 'Estado de usuario no válido'
            ], 403);
        }

        $token = $usuario->createToken('auth_token')->plainTextToken;

        Cache::forget("login_intentos_{$documento}");
        Cache::forget("login_bloqueado_{$documento}");

        return response()->json([
            'success' => true,
            'mensaje' => 'Login exitoso',
            'usuario' => [
                'documento' => $usuario->documento,
                'nombre' => $usuario->nombre,
                'apellido' => $usuario->apellido,
                'rol' => $usuario->rol?->cargo ?? 'Sin rol',
                'cod_estado_usuario' => $usuario->cod_estado_usuario
            ],
            'token' => $token
        ]);
    }

    public function register(Request $request)
    {
        $validated = $request->validate([
            'documento' => 'required|unique:usuario,documento|digits:10',
            'cod_rol' => 'required|exists:rol,cod_rol',
            'nombre' => 'required|string',
            'apellido' => 'required|string',
            'password' => 'required|min:6|max:15'
        ]);

        $rol = Rol::where('cod_rol', $validated['cod_rol'])->first();

        $usuario = Usuario::create([
            'documento' => $validated['documento'],
            'nombre' => $validated['nombre'],
            'apellido' => $validated['apellido'],
            'password' => Hash::make($validated['password']),
            'cod_rol' => $rol->cod_rol,
            'cod_estado_usuario' => 1
        ]);

        return response()->json([
            'success' => true,
            'usuario' => $usuario
        ], 201);
    }

    public function logout(Request $request)
    {
        $request->user()->currentAccessToken()->delete();

        return response()->json([
            'success' => true,
            'mensaje' => 'Logout exitoso'
        ]);
    }

    public function validarActivacion(Request $request)
    {
        $validated = $request->validate([
            'documento' => 'required|string'
        ]);

        $usuario = Usuario::where('documento', $validated['documento'])
            ->orWhere('nombre', 'like', "%{$validated['documento']}%")
            ->first();

        if (!$usuario) {
            return response()->json([
                'success' => false,
                'mensaje' => 'Usuario no encontrado'
            ], 404);
        }

        return response()->json([
            'success' => true,
            'usuario' => [
                'documento' => $usuario->documento,
                'nombre' => $usuario->nombre,
                'apellido' => $usuario->apellido,
                'correo' => $usuario->correos()->first()?->correo ?? '',
                'rol' => $usuario->rol?->cargo ?? 'Sin rol',
                'cod_estado_usuario' => $usuario->cod_estado_usuario
            ]
        ]);
    }

    public function activarCuenta(Request $request)
    {
        $validated = $request->validate([
            'documento' => 'required|exists:usuario,documento|digits:10',
            'password' => 'required|min:6|max:15',
            'confirmPassword' => 'required|same:password'
        ]);

        $usuario = Usuario::where('documento', $validated['documento'])->first();

        if ($usuario->cod_estado_usuario === 3) {
            return response()->json([
                'success' => false,
                'mensaje' => 'Tu usuario está bloqueado. Por favor comunícate con soporte'
            ], 403);
        }

        if ($usuario->cod_estado_usuario === 1) {
            return response()->json([
                'success' => false,
                'mensaje' => 'Tu usuario ya está activo. Por favor inicia sesión'
            ], 403);
        }

        $usuario->password = Hash::make($validated['password']);
        $usuario->cod_estado_usuario = 1;
        $usuario->save();

        return response()->json([
            'success' => true,
            'mensaje' => 'Cuenta activada exitosamente'
        ]);
    }
}