<?php

namespace App\Http\Controllers;

use App\Models\Inventario;
use App\Traits\ApiResponse;
use Illuminate\Http\Request;

class InventarioController extends Controller
{
    use ApiResponse;

    /**
     * GET /api/inventario
     * Listar inventario con paginación y filtros
     */
    public function index(Request $request)
    {
        $perPage = min($request->get('per_page', 10), 100);
        $page = $request->get('page', 1);

        $query = Inventario::with('estado', 'tipo', 'ubicacion');

        // Filtros opcionales
        if ($request->filled('busqueda')) {
            $busqueda = $request->busqueda;
            $query->where('elemento', 'like', "%$busqueda%")
                  ->orWhere('cod_elemento', 'like', "%$busqueda%");
        }

        if ($request->filled('cod_estado_elemento')) {
            $query->where('cod_estado_elemento', $request->cod_estado_elemento);
        }

        if ($request->filled('cod_tipo_elemento')) {
            $query->where('cod_tipo_elemento', $request->cod_tipo_elemento);
        }

        $inventario = $query->paginate($perPage, ['*'], 'page', $page);

        return $this->paginatedResponse($inventario, 'Inventario obtenido correctamente');
    }

    /**
     * POST /api/inventario
     * Crear nuevo elemento
     */
    public function store(Request $request)
    {
        $validated = $request->validate([
            'elemento' => 'required|string|max:100',
            'cod_elemento' => 'required|unique:inventario,cod_elemento',
            'id_ubicacion' => 'required|exists:ubi_elemento,cod_ubicacion',
            'cod_tipo_elemento' => 'required|exists:tipo_elemento,cod_tipo',
            'cod_estado_elemento' => 'required|exists:estado_elemento,cod_estado',
            'marca' => 'nullable|string|max:50',
            'descripcion' => 'nullable|string'
        ]);

        try {
            $inventario = Inventario::create($validated);

            return $this->successResponse(
                $inventario->load('estado', 'tipo', 'ubicacion'),
                'Elemento creado correctamente',
                201
            );
        } catch (\Exception $e) {
            return $this->errorResponse(
                'Error al crear elemento: ' . $e->getMessage(),
                500
            );
        }
    }

    /**
     * GET /api/inventario/{id}
     * Obtener elemento específico
     */
    public function show($id)
    {
        $inventario = Inventario::with('estado', 'tipo', 'ubicacion')->find($id);

        if (!$inventario) {
            return $this->notFoundResponse('Elemento de inventario');
        }

        return $this->successResponse(
            $inventario,
            'Elemento obtenido correctamente'
        );
    }

    /**
     * PUT /api/inventario/{id}
     * Actualizar elemento
     */
    public function update(Request $request, $id)
    {
        $inventario = Inventario::find($id);

        if (!$inventario) {
            return $this->notFoundResponse('Elemento de inventario');
        }

        $validated = $request->validate([
            'elemento' => 'sometimes|string|max:100',
            'id_ubicacion' => 'sometimes|exists:ubi_elemento,cod_ubicacion',
            'cod_tipo_elemento' => 'sometimes|exists:tipo_elemento,cod_tipo',
            'cod_estado_elemento' => 'sometimes|exists:estado_elemento,cod_estado',
            'marca' => 'nullable|string|max:50',
            'descripcion' => 'nullable|string'
        ]);

        try {
            $inventario->update($validated);

            return $this->successResponse(
                $inventario->load('estado', 'tipo', 'ubicacion'),
                'Elemento actualizado correctamente'
            );
        } catch (\Exception $e) {
            return $this->errorResponse(
                'Error al actualizar elemento: ' . $e->getMessage(),
                500
            );
        }
    }

    /**
     * DELETE /api/inventario/{id}
     * Eliminar elemento
     */
    public function destroy($id)
    {
        $inventario = Inventario::find($id);

        if (!$inventario) {
            return $this->notFoundResponse('Elemento de inventario');
        }

        try {
            $inventario->delete();

            return $this->successResponse(
                null,
                'Elemento eliminado correctamente'
            );
        } catch (\Exception $e) {
            return $this->errorResponse(
                'Error al eliminar elemento: ' . $e->getMessage(),
                500
            );
        }
    }

    /**
     * GET /api/inventario/elementos-tipo/{tipo}
     * Obtener elementos por tipo
     */
    public function obtenerElementosPorTipo($tipo, Request $request)
    {
        $perPage = min($request->get('per_page', 10), 100);

        $elementos = Inventario::where('cod_tipo_elemento', $tipo)
            ->with('estado', 'tipo', 'ubicacion')
            ->paginate($perPage);

        if ($elementos->isEmpty()) {
            return $this->successResponse(
                [],
                'No hay elementos de este tipo'
            );
        }

        return $this->paginatedResponse($elementos, 'Elementos obtenidos por tipo');
    }

    /**
     * GET /api/inventario/exportar
     * Exportar inventario (simulado, retorna JSON)
     */
    public function exportarInventario()
    {
        try {
            $inventario = Inventario::with('estado', 'tipo', 'ubicacion')->get();

            if ($inventario->isEmpty()) {
                return $this->successResponse(
                    [],
                    'No hay datos para exportar'
                );
            }

            // Retornar JSON que el frontend puede descargar como CSV/Excel
            return response()->json([
                'success' => true,
                'data' => $inventario,
                'total' => $inventario->count(),
                'timestamp' => now()->toIso8601String()
            ]);
        } catch (\Exception $e) {
            return $this->errorResponse(
                'Error al exportar inventario: ' . $e->getMessage(),
                500
            );
        }
    }
}