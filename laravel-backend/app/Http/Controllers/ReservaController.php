<?php

namespace App\Http\Controllers;

use App\Models\Reserva;
use App\Traits\ApiResponse;
use Illuminate\Http\Request;

class ReservaController extends Controller
{
    use ApiResponse;

    /**
     * GET /api/reserva
     * Listar todas las reserva con paginación
     */
    public function index(Request $request)
    {
        $perPage = min($request->get('per_page', 10), 100);
        $page = $request->get('page', 1);

        $query = Reserva::with('usuario', 'estado');

        // Filtros opcionales
        if ($request->filled('documento')) {
            $query->where('documento', $request->documento);
        }

        if ($request->filled('estado')) {
            $query->where('Num_estado', $request->estado);
        }

        if ($request->filled('fecha_desde')) {
            $query->whereDate('fecha', '>=', $request->fecha_desde);
        }

        if ($request->filled('fecha_hasta')) {
            $query->whereDate('fecha', '<=', $request->fecha_hasta);
        }

        $reserva = $query->orderBy('fecha', 'desc')
                         ->paginate($perPage, ['*'], 'page', $page);

        return $this->paginatedResponse($reserva, 'reserva obtenidas correctamente');
    }

    /**
     * POST /api/reserva
     * Crear nueva reserva
     */
    public function store(Request $request)
    {
        $validated = $request->validate([
            'documento' => 'required|exists:usuario,documento',
            'Num_estado' => 'required|exists:estado_reserva,Num_estado',
            'fecha' => 'required|date',
            'plazo' => 'nullable|date|after:fecha',
            'cantidad' => 'nullable|integer|min:1',
            'elemento' => 'nullable|string|max:100'
        ]);

        try {
            $reserva = Reserva::create($validated);

            return $this->successResponse(
                $reserva->load('usuario', 'estado'),
                'Reserva creada correctamente',
                201
            );
        } catch (\Exception $e) {
            return $this->errorResponse(
                'Error al crear reserva: ' . $e->getMessage(),
                500
            );
        }
    }

    /**
     * GET /api/reserva/{id}
     * Obtener una reserva específica
     */
    public function show($id)
    {
        $reserva = Reserva::with('usuario', 'estado')->find($id);

        if (!$reserva) {
            return $this->notFoundResponse('Reserva');
        }

        return $this->successResponse(
            $reserva,
            'Reserva obtenida correctamente'
        );
    }

    /**
     * PUT /api/reserva/{id}
     * Actualizar una reserva
     */
    public function update(Request $request, $id)
    {
        $reserva = Reserva::find($id);

        if (!$reserva) {
            return $this->notFoundResponse('Reserva');
        }

        $validated = $request->validate([
            'Num_estado' => 'sometimes|exists:estado_reserva,Num_estado',
            'fecha' => 'sometimes|date',
            'plazo' => 'nullable|date|after:fecha',
            'cantidad' => 'nullable|integer|min:1',
            'elemento' => 'nullable|string|max:100'
        ]);

        try {
            $reserva->update($validated);

            return $this->successResponse(
                $reserva->load('usuario', 'estado'),
                'Reserva actualizada correctamente'
            );
        } catch (\Exception $e) {
            return $this->errorResponse(
                'Error al actualizar reserva: ' . $e->getMessage(),
                500
            );
        }
    }

    /**
     * DELETE /api/reserva/{id}
     * Eliminar una reserva
     */
    public function destroy($id)
    {
        $reserva = Reserva::find($id);

        if (!$reserva) {
            return $this->notFoundResponse('Reserva');
        }

        try {
            $reserva->delete();

            return $this->successResponse(
                null,
                'Reserva eliminada correctamente'
            );
        } catch (\Exception $e) {
            return $this->errorResponse(
                'Error al eliminar reserva: ' . $e->getMessage(),
                500
            );
        }
    }
}