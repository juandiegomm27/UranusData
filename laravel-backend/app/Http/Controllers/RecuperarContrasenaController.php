<?php

namespace App\Http\Controllers;

use Illuminate\Support\Facades\Log;
use App\Models\Usuario;
use App\Models\PasswordResetToken;
use App\Mail\NotificationMail;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Mail;
use Illuminate\Support\Facades\DB;

class RecuperarContrasenaController extends Controller
{
    public function solicitarRecuperacion(Request $request)
    {
        $validated = $request->validate([
            'documento' => 'required|string|exists:usuario,documento',
            'correo' => 'required|email'
        ]);

        $correo = DB::table('correo')
            ->where('documento', $validated['documento'])
            ->where('correo', $validated['correo'])
            ->first();

        if (!$correo) {
            return response()->json([
                'status' => 'error',
                'mensaje' => 'El documento y el correo no coinciden'
            ], 404);
        }

        $usuario = Usuario::find($validated['documento']);

        if (!$usuario) {
            return response()->json([
                'status' => 'error',
                'mensaje' => 'Usuario no encontrado'
            ], 404);
        }

        if ($usuario->cod_estado_usuario == 2) {
            return response()->json([
                'status' => 'error',
                'mensaje' => 'Tu usuario está inactivo. No puedes recuperar contraseña'
            ], 403);
        }

        if ($usuario->cod_estado_usuario == 3) {
            return response()->json([
                'status' => 'error',
                'mensaje' => 'Tu cuenta está bloqueada. Contacta a soporte.'
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

        if ($correo) {
            try {
                Mail::to($correo->correo)->send(new NotificationMail('recovery-request', [
                    'nombre' => $usuario->nombre,
                    'token' => $token,
                    'subject' => 'Recuperación de Contraseña - UranusData',
                    'enlace' => env('FRONTEND_URL', 'http://localhost:4200') . '/recuperar-contrasena?token=' . $token
                ]));
            } catch (\Exception $e) {
                Log::error('Error enviando email de recuperación: ' . $e->getMessage());
                return response()->json([
                    'status' => 'error',
                    'mensaje' => 'Error al enviar el correo electrónico. Intenta nuevamente más tarde.'
                ], 500);
            }
        }

        // CORRECCIÓN CRÍTICA: Se eliminó el token de la respuesta JSON para evitar toma de cuentas por red
        return response()->json([
            'status' => 'success',
            'mensaje' => 'Se ha enviado un enlace de recuperación a tu correo. Revisa tu bandeja de entrada.'
        ]);
    }

    public function verificarToken($token) 
    {
        $resetToken = PasswordResetToken::where('token', $token)->first();

        if (!$resetToken) {
            return response()->json([
                'status' => 'error',
                'mensaje' => 'Token inválido o expirado'
            ], 404);
        }

        if (now()->isAfter($resetToken->expires_at)) {
            $resetToken->delete();
            return response()->json([
                'status' => 'error',
                'mensaje' => 'Token expirado. Solicita uno nuevo.'
            ], 410);
        }

        $usuario = Usuario::find($resetToken->documento);

        if (!$usuario) {
            return response()->json([
                'status' => 'error',
                'mensaje' => 'Usuario no encontrado'
            ], 404);
        }

        return response()->json([
            'status' => 'success',
            'usuario' => [
                'documento' => $usuario->documento,
                'nombre' => $usuario->nombre,
                'apellido' => $usuario->apellido,
                'cod_estado_usuario' => $usuario->cod_estado_usuario
            ]
        ]);
    }

    public function confirmarRecuperacion(Request $request) 
    {
        $validated = $request->validate([
            'token' => 'required|string',
            'password' => 'required|string|min:6'
        ]);

        $resetToken = PasswordResetToken::where('token', $validated['token'])->first();

        if (!$resetToken) {
            return response()->json([
                'status' => 'error',
                'mensaje' => 'Token inválido'
            ], 404);
        }

        if (now()->isAfter($resetToken->expires_at)) {
            $resetToken->delete();
            return response()->json([
                'status' => 'error',
                'mensaje' => 'Token expirado'
            ], 410);
        }

        $usuario = Usuario::find($resetToken->documento);

        if (!$usuario) {
            return response()->json([
                'status' => 'error',
                'mensaje' => 'Usuario no encontrado'
            ], 404);
        }

        if ($usuario->cod_estado_usuario == 3) {
            return response()->json([
                'status' => 'error',
                'mensaje' => 'Tu cuenta está bloqueada. Contacta a soporte.'
            ], 403);
        }

        $usuario->password = bcrypt($validated['password']);
        $usuario->cod_estado_usuario = 1;
        $usuario->save();

        $resetToken->delete();

        return response()->json([
            'status' => 'success',
            'mensaje' => 'Contraseña actualizada. Tu cuenta está activa.'
        ]);
    }
}