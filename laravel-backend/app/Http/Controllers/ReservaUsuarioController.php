<?php

namespace App\Http\Controllers;

use App\Models\Reserva;
use App\Models\Usuario;
use Illuminate\Http\Request;
use App\Models\VHistorialPrestamos;
use App\Models\VHistorialReservas;

class ReservaUsuarioController extends Controller
{
    public function historialUsuario($documento, Request $request){
        $usuario = Usuario::find($documento);

        if (!$usuario) {
            return response()->json(['status' => 'error', 'mensaje' => 'Usuario no encontrado'], 404);
        }

        $perPage = $request->get('per_page', 10);
        $tipo = $request->get('tipo', 'reserva');
        $estado = $request->get('estado');
        $elemento = $request->get('elemento');
        $fecha = $request->get('fecha');

        if ($tipo === 'prestamos') {
            $query = VHistorialPrestamos::where('documento', $documento);

            if ($estado) {
                $query->where('estado_prestamo', $estado);
            }

            if ($elemento) {
                $query->where('elemento', 'like', "%$elemento%");
            }

            if ($fecha) {
                $query->whereDate('fecha_inicio', $fecha);
            }

            $datos = $query->paginate($perPage);
        } else {
            $query = VHistorialReservas::where('documento', $documento);

            if ($estado) {
                $query->where('estado_reserva', $estado);
            }

            if ($elemento) {
                $query->where('elemento', 'like', "%$elemento%");
            }

            if ($fecha) {
                $query->whereDate('fecha', $fecha);
            }

            $datos = $query->paginate($perPage);
        }

        return response()->json([
            'status' => 'success',
            'data' => $datos->items(),
            'total' => $datos->total(),
            'per_page' => $datos->perPage(),
            'current_page' => $datos->currentPage(),
            'last_page' => $datos->lastPage()
        ]);
    }

    public function estadosReserva()
    {
        $estados = \App\Models\EstadoReserva::all();
        return response()->json(['status' => 'success', 'data' => $estados]);
    }

    public function obtenerMisReservas(Request $request)
    {
        $documento = $request->user()?->documento;
        if (!$documento) {
            return response()->json(['status' => 'error', 'mensaje' => 'Usuario no identificado'], 401);
        }

        $perPage = $request->get('per_page', 10);
        $reservas = Reserva::where('documento', $documento)
            ->with(['estado', 'usuario'])
            ->orderBy('fecha', 'desc')
            ->paginate($perPage);

        return response()->json([
            'status' => 'success',
            'data' => $reservas->items(),
            'total' => $reservas->total(),
            'last_page' => $reservas->lastPage()
        ]);
    }

    public function crearReserva(Request $request)
    {
        $documento = $request->user()?->documento;
        $validated = $request->validate([
            'fecha' => 'required|date',
            'plazo' => 'nullable|date',
            'cantidad' => 'nullable|integer|min:1',
            'elemento' => 'required|string|max:100'
        ]);

        $reserva = Reserva::create([
            'documento' => $documento,
            'Num_estado' => 1,
            'fecha' => $validated['fecha'],
            'plazo' => $validated['plazo'] ?? null,
            'cantidad' => $validated['cantidad'] ?? 1,
            'elemento' => $validated['elemento']
        ]);

        return response()->json([
            'status' => 'success',
            'mensaje' => 'Reserva creada exitosamente',
            'data' => $reserva
        ], 201);
    }

    public function actualizarReserva(Request $request, $id)
    {
        $documento = $request->user()?->documento;
        $reserva = Reserva::where('id_Reserva', $id)->where('documento', $documento)->first();

        if (!$reserva) {
            return response()->json(['status' => 'error', 'mensaje' => 'Reserva no encontrada'], 404);
        }

        $validated = $request->validate([
            'fecha' => 'sometimes|date',
            'plazo' => 'nullable|date',
            'cantidad' => 'nullable|integer|min:1',
            'elemento' => 'sometimes|string|max:100'
        ]);

        $reserva->update($validated);

        return response()->json([
            'status' => 'success',
            'mensaje' => 'Reserva actualizada exitosamente',
            'data' => $reserva
        ]);
    }

    public function cancelarReserva(Request $request, $id)
    {
        $documento = $request->user()?->documento;
        $reserva = Reserva::where('id_Reserva', $id)->where('documento', $documento)->first();

        if (!$reserva) {
            return response()->json(['status' => 'error', 'mensaje' => 'Reserva no encontrada'], 404);
        }

        $reserva->delete();

        return response()->json([
            'status' => 'success',
            'mensaje' => 'Reserva cancelada exitosamente'
        ]);
    }
}