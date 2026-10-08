<?php

namespace App\Services;

use App\Models\ReservaDetalle;

/**
 * El docente pide "un Computador" (tipo + cantidad); la unidad física
 * concreta la asigna el técnico/gerente al entregar, no el sistema. Mientras
 * eso no pase, el detalle queda con id_elemento = null y cod_tipo_elemento
 * con lo pedido. Esta clase calcula cuántas unidades de cada tipo ya están
 * comprometidas en solicitudes pendientes de asignar, para que el catálogo
 * del docente no ofrezca más de las que realmente quedan libres.
 */
class DisponibilidadElementosService
{
    /**
     * @return array<int, int> cod_tipo_elemento => cantidad ya pedida y sin asignar
     */
    public static function cantidadesComprometidasPorTipo(): array
    {
        return ReservaDetalle::whereNull('id_elemento')
            ->whereNotNull('cod_tipo_elemento')
            ->whereHas('reserva', function ($q) {
                $q->where('Num_estado', 1)
                  ->where(function ($sub) {
                      $sub->whereDoesntHave('prestamo')
                          ->orWhereHas('prestamo', fn ($p) => $p->where('cod_estado_prestamo', 1));
                  });
            })
            ->selectRaw('cod_tipo_elemento, SUM(cantidad_solicitada) as total')
            ->groupBy('cod_tipo_elemento')
            ->pluck('total', 'cod_tipo_elemento')
            ->toArray();
    }
}
