<?php

namespace App\Http\Controllers;

use App\Models\Reserva;
use App\Models\Usuario;
use Illuminate\Http\Request;

class ReservaUsuarioController extends Controller
{
    public function historialUsuario($documento, Request $request)
    {
        $usuario = Usuario::find($documento);

        if (!$usuario) {
            return response()->json(['status' => 'error', 'mensaje' => 'Usuario no encontrado'], 404);
        }

        $perPage = $request->get('per_page', 10);
        $estado = $request->get('estado');
        $elemento = $request->get('elemento');
        $fecha = $request->get('fecha');

        $query = Reserva::where('documento', $documento)
            ->with('usuario', 'estado', 'prestamo');

        if ($estado) {
            $query->where('Num_estado', $estado);
        }

        if ($elemento) {
            $query->where('elemento', 'like', "%$elemento%");
        }

        if ($fecha) {
            $query->whereDate('fecha', $fecha);
        }

        $reservas = $query->paginate($perPage);

        return response()->json([
            'status' => 'success',
            'data' => $reservas->items(),
            'total' => $reservas->total(),
            'per_page' => $reservas->perPage(),
            'current_page' => $reservas->currentPage(),
            'last_page' => $reservas->lastPage()
        ]);
    }

    public function estadosReserva()
    {
        $estados = \App\Models\EstadoReserva::all();
        return response()->json(['status' => 'success', 'data' => $estados]);
    }
}