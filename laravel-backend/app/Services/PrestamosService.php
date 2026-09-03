<?php

namespace App\Services;

use App\Models\Prestamo;
use App\Traits\ApiResponse;

class PrestamosService
{
    use ApiResponse;

    const ESTADOS = [
        1 => 'Solicitado',
        2 => 'Entregado',
        3 => 'Devuelto',
        4 => 'Perdido',
        5 => 'Dañado'
    ];


    public static function puedeTransicionarEstado($estadoActual, $estadoNuevo): bool
    {
        // Definir transiciones permitidas
        $transicionesPermitidas = [
            1 => [2, 4], 
            2 => [3, 4, 5],
            3 => [],
            4 => [],
            5 => [] 
        ];

        return in_array($estadoNuevo, $transicionesPermitidas[$estadoActual] ?? []);
    }


    public static function obtenerNombreEstado($codigoEstado): string
    {
        return self::ESTADOS[$codigoEstado] ?? 'Desconocido';
    }

    public static function calcularDiasEnPrestamo(\DateTime $fechaInicio, ?\DateTime $fechaDevolucion = null): int
    {
        $ahora = $fechaDevolucion ?? now();
        return $ahora->diffInDays($fechaInicio);
    }
}