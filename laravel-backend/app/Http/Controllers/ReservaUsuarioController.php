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
        $tipo = $request->get('tipo', 'reservas'); // 'reservas' o 'prestamos'
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
}