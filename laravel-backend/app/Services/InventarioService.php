<?php

namespace App\Services;

use App\Models\InventarioMovimiento;
use Illuminate\Support\Facades\Auth;

class InventarioService
{
    public const TIPO_ALTA = 'alta';
    public const TIPO_EDICION = 'edicion';
    public const TIPO_ESTADO = 'estado';
    public const TIPO_TRASLADO = 'traslado';
    public const TIPO_VINCULO = 'vinculo';
    public const TIPO_BAJA = 'baja';
    public const TIPO_RESTAURACION = 'restauracion';

    public static function registrarMovimiento(
        int $idElemento,
        string $tipo,
        string $descripcion,
        ?array $datos = null
    ): InventarioMovimiento {
        $usuario = Auth::user();

        return InventarioMovimiento::create([
            'id_elemento' => $idElemento,
            'tipo' => $tipo,
            'descripcion' => $descripcion,
            'datos' => $datos,
            'documento' => $usuario?->documento,
            'usuario' => $usuario ? trim($usuario->nombre . ' ' . $usuario->apellido) : null,
            'fecha' => now(),
        ]);
    }
}