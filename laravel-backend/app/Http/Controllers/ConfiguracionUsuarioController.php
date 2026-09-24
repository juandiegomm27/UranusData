<?php

namespace App\Http\Controllers;

use App\Models\PreferenciaUsuario;
use App\Models\Notificacion;
use App\Traits\ApiResponse;
use Illuminate\Http\Request;

class ConfiguracionUsuarioController extends Controller
{
    use ApiResponse;

    // --- AJUSTES ---
    public function obtenerAjustes(Request $request)
    {
        $documento = $request->user()->documento;
        $ajustes = PreferenciaUsuario::firstOrCreate(
            ['documento' => $documento],
            ['tema_oscuro' => false, 'notificaciones_email' => true, 'notificaciones_push' => true, 'idioma' => 'es']
        );

        return $this->successResponse($ajustes, 'Ajustes obtenidos');
    }

    public function actualizarAjustes(Request $request)
    {
        $validated = $request->validate([
            'tema_oscuro' => 'boolean',
            'notificaciones_email' => 'boolean',
            'notificaciones_push' => 'boolean',
            'idioma' => 'string|max:5'
        ]);

        $ajustes = PreferenciaUsuario::updateOrCreate(
            ['documento' => $request->user()->documento],
            $validated
        );

        return $this->successResponse($ajustes, 'Ajustes guardados correctamente');
    }

    // --- NOTIFICACIONES ---
    public function obtenerNotificaciones(Request $request)
    {
        $notificaciones = Notificacion::where('documento', $request->user()->documento)
            ->orderBy('fecha_creacion', 'desc')
            ->limit(50)
            ->get();

        return $this->successResponse([
            'no_leidas' => $notificaciones->where('leida', false)->count(),
            'notificaciones' => $notificaciones->values()
        ], 'Notificaciones obtenidas');
    }

    public function marcarNotificacionLeida(Request $request, $id)
    {
        $notificacion = Notificacion::where('id_notificacion', $id)
            ->where('documento', $request->user()->documento)
            ->first();

        if ($notificacion) {
            $notificacion->update(['leida' => true]);
        }

        return $this->successResponse(null, 'Notificación marcada como leída');
    }
}