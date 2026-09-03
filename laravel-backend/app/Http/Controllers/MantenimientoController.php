<?php

namespace App\Http\Controllers;

use App\Models\Mantenimiento;
use App\Traits\ApiResponse;
use Illuminate\Http\Request;

class MantenimientoController extends Controller
{
    use ApiResponse;

    /**
     * GET /api/mantenimiento
     * Listar todos los mantenimiento con paginación
     */
    public function index(Request $request)
    {
        $perPage = min($request->get('per_page', 10), 100);
        $page = $request->get('page', 1);

        $query = Mantenimiento::with('usuario', 'tipo', 'inventario');

        // Filtros opcionales
        if ($request->filled('documento')) {
            $query->where('documento', $request->documento);
        }

        if ($request->filled('estado')) {
            $query->where('estado', $request->estado);
        }

        if ($request->filled('tipo_cod_tipo')) {
            $query->where('tipo_cod_tipo', $request->tipo_cod_tipo);
        }

        if ($request->filled('fecha_desde')) {
            $query->whereDate('created_at', '>=', $request->fecha_desde);
        }

        if ($request->filled('fecha_hasta')) {
            $query->whereDate('created_at', '<=', $request->fecha_hasta);
        }

        $mantenimiento = $query->orderBy('created_at', 'desc')
                                ->paginate($perPage, ['*'], 'page', $page);

        return $this->paginatedResponse($mantenimiento, 'mantenimiento obtenidos correctamente');
    }

    /**
     * POST /api/mantenimiento
     * Crear nuevo mantenimiento
     */
    public function store(Request $request)
    {
        $validated = $request->validate([
            'id_elemento' => 'required|exists:inventario,id_elemento',
            'cod_elemento' => 'required|string',
            'tipo_cod_tipo' => 'required|exists:tipo_mantenimiento,cod_tipo',
            'documento' => 'required|exists:usuario,documento',
            'descripcion' => 'nullable|string',
            'estado' => 'nullable|in:pendiente,en_proceso,completado'
        ]);

        try {
            $mantenimiento = Mantenimiento::create($validated);

            return $this->successResponse(
                $mantenimiento->load('usuario', 'tipo', 'inventario'),
                'Mantenimiento creado correctamente',
                201
            );
        } catch (\Exception $e) {
            return $this->errorResponse(
                'Error al crear mantenimiento: ' . $e->getMessage(),
                500
            );
        }
    }

    /**
     * GET /api/mantenimiento/{id}
     * Obtener un mantenimiento específico
     */
    public function show($id)
    {
        $mantenimiento = Mantenimiento::with('usuario', 'tipo', 'inventario')->find($id);

        if (!$mantenimiento) {
            return $this->notFoundResponse('Mantenimiento');
        }

        return $this->successResponse(
            $mantenimiento,
            'Mantenimiento obtenido correctamente'
        );
    }

    /**
     * PUT /api/mantenimiento/{id}
     * Actualizar un mantenimiento
     */
    public function update(Request $request, $id)
    {
        $mantenimiento = Mantenimiento::find($id);

        if (!$mantenimiento) {
            return $this->notFoundResponse('Mantenimiento');
        }

        $validated = $request->validate([
            'tipo_cod_tipo' => 'sometimes|exists:tipo_mantenimiento,cod_tipo',
            'descripcion' => 'nullable|string',
            'estado' => 'sometimes|in:pendiente,en_proceso,completado'
        ]);

        try {
            $mantenimiento->update($validated);

            return $this->successResponse(
                $mantenimiento->load('usuario', 'tipo', 'inventario'),
                'Mantenimiento actualizado correctamente'
            );
        } catch (\Exception $e) {
            return $this->errorResponse(
                'Error al actualizar mantenimiento: ' . $e->getMessage(),
                500
            );
        }
    }

    /**
     * DELETE /api/mantenimiento/{id}
     * Eliminar un mantenimiento
     */
    public function destroy($id)
    {
        $mantenimiento = Mantenimiento::find($id);

        if (!$mantenimiento) {
            return $this->notFoundResponse('Mantenimiento');
        }

        try {
            $mantenimiento->delete();

            return $this->successResponse(
                null,
                'Mantenimiento eliminado correctamente'
            );
        } catch (\Exception $e) {
            return $this->errorResponse(
                'Error al eliminar mantenimiento: ' . $e->getMessage(),
                500
            );
        }
    }

    /**
     * GET /api/mantenimiento/activos
     * Listar mantenimiento activos (pendiente o en_proceso)
     */
    public function obtenerMantenimientosActivos(Request $request)
    {
        $perPage = min($request->get('per_page', 50), 100);

        $activos = Mantenimiento::whereIn('estado', ['pendiente', 'en_proceso'])
            ->with('usuario', 'tipo', 'inventario')
            ->orderBy('created_at', 'asc')
            ->paginate($perPage);

        return $this->paginatedResponse($activos, 'mantenimiento activos obtenidos');
    }

    /**
     * PUT /api/mantenimiento/{id}/completar
     * Marcar mantenimiento como completado
     */
    public function completarMantenimiento($id)
    {
        $mantenimiento = Mantenimiento::find($id);

        if (!$mantenimiento) {
            return $this->notFoundResponse('Mantenimiento');
        }

        try {
            $mantenimiento->update([
                'estado' => 'completado',
                'fecha_fin' => now()
            ]);

            return $this->successResponse(
                $mantenimiento,
                'Mantenimiento marcado como completado'
            );
        } catch (\Exception $e) {
            return $this->errorResponse(
                'Error al completar mantenimiento: ' . $e->getMessage(),
                500
            );
        }
    }
}