<?php

namespace App\Http\Controllers;

use App\Models\Usuario;
use App\Models\Rol;
use App\Models\PasswordResetToken;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Hash;
use Illuminate\Support\Facades\Cache;
use Illuminate\Support\Facades\Log;
use Illuminate\Support\Facades\Mail;
use App\Mail\NotificationMail;

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

    public function solicitarRecuperacion(Request $request)
    {
        $validated = $request->validate([
            'documento' => 'required|digits:10'
        ]);

        $usuario = Usuario::where('documento', $validated['documento'])->first();

        if (!$usuario) {
            return response()->json([
                'success' => false,
                'mensaje' => 'Usuario no encontrado'
            ], 404);
        }

        // Validar estado del usuario
        if ($usuario->cod_estado_usuario == 2) {
            return response()->json([
                'success' => false,
                'mensaje' => 'Tu usuario está inactivo. No puedes recuperar contraseña'
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
                'mensaje' => 'No puedes recuperar contraseña en este momento'
            ], 403);
        }

        $token = bin2hex(random_bytes(32));
        $expiresAt = now()->addHours(1);

        PasswordResetToken::where('documento', $usuario->documento)->delete();

        PasswordResetToken::create([
            'documento' => $usuario->documento,
            'token' => $token,
            'expires_at' => $expiresAt
        ]);

        $correo = $usuario->correos()->first()?->correo;

        if ($correo) {
            try {
                Mail::send(new NotificationMail('recovery-request', [
                    'nombre' => $usuario->nombre,
                    'token' => $token,
                    'subject' => 'Recuperación de Contraseña - UranusData',
                    'enlace' => env('FRONTEND_URL', 'http://localhost:4200') . '/recuperar-contrasena?token=' . $token
                ]));
            } catch (\Exception $e) {
                Log::error('Error enviando email de recuperación: ' . $e->getMessage());
            }
        }

        return response()->json([
            'success' => true,
            'mensaje' => 'Se ha enviado un enlace de recuperación a tu correo',
            'usuario' => [
                'cod_estado_usuario' => $usuario->cod_estado_usuario
            ]
        ]);
    }

    public function verificarToken(Request $request, $token)
    {
        $validated = $request->validate([
            'token' => 'required|string'
        ]);

        $resetToken = PasswordResetToken::where('token', $token)->first();

        if (!$resetToken || $resetToken->expires_at < now()) {
            return response()->json([
                'success' => false,
                'mensaje' => 'El token ha expirado o es inválido'
            ], 401);
        }

        return response()->json([
            'success' => true,
            'mensaje' => 'Token válido'
        ]);
    }

    public function confirmarRecuperacion(Request $request)
    {
        $validated = $request->validate([
            'token' => 'required|string',
            'password' => 'required|string|min:6|max:15',
            'confirmPassword' => 'required|string|same:password'
        ]);

        $resetToken = PasswordResetToken::where('token', $validated['token'])->first();

        if (!$resetToken || $resetToken->expires_at < now()) {
            return response()->json([
                'success' => false,
                'mensaje' => 'El token ha expirado o es inválido'
            ], 401);
        }

        $usuario = Usuario::where('documento', $resetToken->documento)->first();

        if (!$usuario) {
            return response()->json([
                'success' => false,
                'mensaje' => 'Usuario no encontrado'
            ], 404);
        }

        $usuario->password = Hash::make($validated['password']);
        $usuario->save();

        $resetToken->delete();

        return response()->json([
            'success' => true,
            'mensaje' => 'Contraseña actualizada exitosamente'
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