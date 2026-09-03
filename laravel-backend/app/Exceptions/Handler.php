<?php

namespace App\Exceptions;

use Illuminate\Foundation\Exceptions\Handler as ExceptionHandler;
use Throwable;

class Handler extends ExceptionHandler
{
    public function register(): void
    {
        $this->reportable(function (Throwable $e) {
            //
        });

        // Manejar ModelNotFoundException
        $this->renderable(function (\Illuminate\Database\Eloquent\ModelNotFoundException $e, $request) {
            if ($request->expectsJson()) {
                return response()->json([
                    'success' => false,
                    'mensaje' => 'Recurso no encontrado',
                    'timestamp' => now()->toIso8601String()
                ], 404);
            }
        });

        // Manejar ValidationException
        $this->renderable(function (\Illuminate\Validation\ValidationException $e, $request) {
            if ($request->expectsJson()) {
                return response()->json([
                    'success' => false,
                    'mensaje' => 'Validación fallida',
                    'errors' => $e->errors(),
                    'timestamp' => now()->toIso8601String()
                ], 422);
            }
        });

        // Manejar AuthenticationException
        $this->renderable(function (\Illuminate\Auth\AuthenticationException $e, $request) {
            if ($request->expectsJson()) {
                return response()->json([
                    'success' => false,
                    'mensaje' => 'No autenticado. Token requerido o inválido.',
                    'timestamp' => now()->toIso8601String()
                ], 401);
            }
        });

        // Manejar AuthorizationException
        $this->renderable(function (\Illuminate\Auth\Access\AuthorizationException $e, $request) {
            if ($request->expectsJson()) {
                return response()->json([
                    'success' => false,
                    'mensaje' => 'No autorizado para esta acción',
                    'timestamp' => now()->toIso8601String()
                ], 403);
            }
        });

        // Manejar excepciones genéricas
        $this->renderable(function (Throwable $e, $request) {
            if ($request->expectsJson()) {
                $statusCode = $e instanceof \Symfony\Component\HttpKernel\Exception\HttpExceptionInterface
                    ? $e->getStatusCode()
                    : 500;

                return response()->json([
                    'success' => false,
                    'mensaje' => config('app.debug') ? $e->getMessage() : 'Error interno del servidor',
                    'timestamp' => now()->toIso8601String()
                ], $statusCode);
            }
        });
    }
}