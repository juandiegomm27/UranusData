<?php

namespace App\Http\Controllers;

use App\Models\Inventario;
use App\Models\StockAccesorio;
use App\Models\TipoElemento;
use App\Services\DisponibilidadElementosService;
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
     * Cuántas unidades hay disponibles por TIPO de elemento (no la lista de
     * unidades físicas): al docente no le corresponde elegir marca/modelo/
     * serial, solo qué tipo de equipo necesita y cuántos. La unidad física
     * concreta la asigna el técnico/gerente al momento de entregar.
     */
    public function elementosDisponibles(Request $request)
    {
        $query = Inventario::where('cod_estado_elemento', 1)
            ->join('tipo_elemento', 'tipo_elemento.cod_tipo_elemento', '=', 'inventario.cod_tipo_elemento')
            ->select('inventario.cod_tipo_elemento', 'tipo_elemento.tipo')
            ->selectRaw('count(*) as cantidad_total')
            ->groupBy('inventario.cod_tipo_elemento', 'tipo_elemento.tipo');

        if ($request->filled('search')) {
            $query->where('tipo_elemento.tipo', 'like', '%' . $request->search . '%');
        }

        if ($request->filled('tipo')) {
            $query->where('inventario.cod_tipo_elemento', $request->tipo);
        }

        $comprometidos = DisponibilidadElementosService::cantidadesComprometidasPorTipo();

        $tipos = $query->orderBy('tipo_elemento.tipo')->get()
            ->map(function ($fila) use ($comprometidos) {
                $fila->cantidad_disponible = max(0, $fila->cantidad_total - ($comprometidos[$fila->cod_tipo_elemento] ?? 0));
                unset($fila->cantidad_total);
                return $fila;
            })
            ->filter(fn ($fila) => $fila->cantidad_disponible > 0)
            ->values();

        return $this->successResponse($tipos, 'Tipos de elementos disponibles obtenidos correctamente');
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
