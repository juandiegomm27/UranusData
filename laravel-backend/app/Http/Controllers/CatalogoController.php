<?php

namespace App\Http\Controllers;

use App\Models\Inventario;
use App\Models\ReservaDetalle;
use App\Models\StockAccesorio;
use App\Models\TipoElemento;
use App\Traits\ApiResponse;
use Illuminate\Http\Request;

class CatalogoController extends Controller
{
    use ApiResponse;

    /**
     * GET /api/catalogo/tipos-elemento
     * Catálogo de tipos, para poblar el filtro del selector de reserva.
     */
    public function tipos()
    {
        return $this->successResponse(TipoElemento::orderBy('tipo')->get(), 'Tipos obtenidos correctamente');
    }

    /**
     * GET /api/catalogo/elementos-disponibles
     * Elementos activos que no están de baja/mantenimiento ni en una
     * reserva vigente sin entregar todavía (evita doble reserva del mismo equipo).
     */
    public function elementosDisponibles(Request $request)
    {
        // Toda reserva crea de una vez su registro de préstamo "Solicitado"
        // (cod_estado_prestamo = 1), así que "no entregado todavía" ahora es
        // "no tiene préstamo, o el préstamo sigue en Solicitado" — una vez
        // se entrega (estado >= 2) el elemento ya cambió a cod_estado_elemento
        // != 1 y queda excluido por el where() de más abajo de todos modos.
        $idsReservados = ReservaDetalle::whereHas('reserva', function ($q) {
                $q->where('Num_estado', 1)
                  ->where(function ($sub) {
                      $sub->whereDoesntHave('prestamo')
                          ->orWhereHas('prestamo', fn ($p) => $p->where('cod_estado_prestamo', 1));
                  });
            })
            ->whereNotNull('id_elemento')
            ->pluck('id_elemento');

        $query = Inventario::where('cod_estado_elemento', 1)
            ->whereNotIn('id_elemento', $idsReservados)
            ->with('tipo', 'ubicacion');

        if ($request->filled('search')) {
            $searchTerm = '%' . $request->search . '%';
            $query->where(function ($q) use ($searchTerm) {
                $q->where('nombre_elemento', 'like', $searchTerm)
                  ->orWhere('modelo', 'like', $searchTerm);
            });
        }

        if ($request->filled('tipo')) {
            $query->where('cod_tipo_elemento', $request->tipo);
        }

        $elementos = $query->orderBy('nombre_elemento')->get();

        return $this->successResponse($elementos, 'Elementos disponibles obtenidos correctamente');
    }

    /**
     * GET /api/catalogo/accesorios-disponibles
     * Lotes de accesorios con unidades disponibles para reservar.
     */
    public function accesoriosDisponibles(Request $request)
    {
        $query = StockAccesorio::where('cantidad_disponible', '>', 0)
            ->with('accesorio', 'ubicacion');

        if ($request->filled('search') || $request->filled('tipo')) {
            $query->whereHas('accesorio', function ($q) use ($request) {
                if ($request->filled('search')) {
                    $searchTerm = '%' . $request->search . '%';
                    $q->where(function ($sub) use ($searchTerm) {
                        $sub->where('nombre', 'like', $searchTerm)
                            ->orWhere('modelo', 'like', $searchTerm);
                    });
                }
                if ($request->filled('tipo')) {
                    $q->where('cod_tipo_elemento', $request->tipo);
                }
            });
        }

        $accesorios = $query->get();

        return $this->successResponse($accesorios, 'Accesorios disponibles obtenidos correctamente');
    }
}
