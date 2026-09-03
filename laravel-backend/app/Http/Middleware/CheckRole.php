<?php

namespace App\Http\Middleware;

use Closure;
use Illuminate\Http\Request;
use Symfony\Component\HttpFoundation\Response;

class CheckRole
{
    
    public function handle(Request $request, Closure $next, ...$rol): Response
    {
        // Obtener usuario autenticado
        $user = $request->user();

        if (!$user) {
            return response()->json([
                'success' => false,
                'mensaje' => 'No autorizado. Usuario no autenticado.'
            ], 401);
        }

        // Obtener rol del usuario
        $usuarioRol = $user->rol?->cargo ?? $user->cod_rol;

        // Verificar si el usuario tiene uno de los rol permitidos
        if (!in_array($usuarioRol, $rol)) {
            return response()->json([
                'success' => false,
                'mensaje' => "Acceso prohibido. Rol requerido: " . implode(', ', $rol)
            ], 403);
        }

        return $next($request);
    }
}