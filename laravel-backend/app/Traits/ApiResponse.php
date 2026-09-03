<?php

namespace App\Traits;

use Illuminate\Http\Response;

trait ApiResponse
{
    //Respuesta exitosa
    protected function successResponse($data = null, $mensaje = 'Operación exitosa', $statusCode = 200)
    {
        return response()->json([
            'success' => true,
            'mensaje' => $mensaje,
            'data' => $data,
            'timestamp' => now()->toIso8601String()
        ], $statusCode);
    }

    //Respuesta con paginación
    protected function paginatedResponse($paginated, $mensaje = 'Datos obtenidos correctamente')
    {
        return response()->json([
            'success' => true,
            'mensaje' => $mensaje,
            'data' => $paginated->items(),
            'pagination' => [
                'total' => $paginated->total(),
                'per_page' => $paginated->perPage(),
                'current_page' => $paginated->currentPage(),
                'last_page' => $paginated->lastPage(),
                'from' => $paginated->firstItem(),
                'to' => $paginated->lastItem(),
            ],
            'timestamp' => now()->toIso8601String()
        ], 200);
    }

    //Respuesta de error
    protected function errorResponse($mensaje = 'Error', $statusCode = 400, $errors = null)
    {
        $response = [
            'success' => false,
            'mensaje' => $mensaje,
            'timestamp' => now()->toIso8601String()
        ];

        if ($errors) {
            $response['errors'] = $errors;
        }

        return response()->json($response, $statusCode);
    }

    //Respuesta no encontrado
    protected function notFoundResponse($recurso = 'Recurso')
    {
        return $this->errorResponse(
            $recurso . ' no encontrado',
            404
        );
    }

    //Respuesta no autorizado
    protected function unauthorizedResponse($mensaje = 'No autorizado')
    {
        return $this->errorResponse($mensaje, 401);
    }

    //Respuesta prohibido
    protected function forbiddenResponse($mensaje = 'Acceso prohibido')
    {
        return $this->errorResponse($mensaje, 403);
    }
}