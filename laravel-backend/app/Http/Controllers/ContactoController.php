<?php

namespace App\Http\Controllers;

use App\Mail\NotificationMail;
use App\Traits\ApiResponse;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Log;
use Illuminate\Support\Facades\Mail;
use Illuminate\Support\Facades\Cache;

class ContactoController extends Controller
{
    use ApiResponse;

    public function enviarMensaje(Request $request)
    {
        $validated = $request->validate([
            'asunto' => 'required|string|max:150',
            'descripcion' => 'required|string|max:2000',
        ]);

        $usuario = $request->user();
        $cacheKey = 'bloqueo_soporte_' . $usuario->documento;

        // 1. VERIFICAR LÍMITE DE 2 HORAS
        try {
            if (Cache::has($cacheKey)) {
                $expiracion = Cache::get($cacheKey);
                $tiempoRestante = $expiracion - time();
                
                if ($tiempoRestante > 0) {
                    $minutos = ceil($tiempoRestante / 60);
                    return $this->errorResponse(
                        "Por seguridad y para evitar spam, solo puedes enviar un mensaje cada 2 horas. Intenta de nuevo en $minutos minutos.", 
                        429
                    );
                } else {
                    Cache::forget($cacheKey);
                }
            }
        } catch (\Exception $e) {
            Log::warning('Error verificando caché de soporte: ' . $e->getMessage());
        }

        $correoDestino = env('MAIL_SOPORTE_ADDRESS', env('MAIL_FROM_ADDRESS'));

        // 2. ENVIAR EL CORREO (Aislado)
        try {
            Mail::to($correoDestino)->send(new NotificationMail('contacto-soporte', [
                'subject' => 'Nuevo reporte de soporte - UranusData',
                'asunto' => $validated['asunto'],
                'descripcion' => $validated['descripcion'],
                'nombre' => trim($usuario->nombre . ' ' . $usuario->apellido),
                'documento' => $usuario->documento,
                'rol' => $usuario->rol?->cargo ?? 'Sin rol',
            ]));
        } catch (\Exception $e) {
            Log::error('Error enviando mensaje de contacto: ' . $e->getMessage());
            return $this->errorResponse('No se pudo enviar el mensaje. Intenta nuevamente más tarde.', 500);
        }

        try {
            Cache::put($cacheKey, time() + 7200, 7200);
        } catch (\Exception $e) {
            Log::warning('Error guardando caché de soporte: ' . $e->getMessage());
        }
        return $this->successResponse(null, 'Mensaje enviado correctamente a soporte. Hemos recibido tu solicitud.');
    }
}