<?php

namespace App\Http\Controllers;

use App\Models\Reserva;
use App\Models\Usuario;
use Illuminate\Http\Request;
use App\Models\VHistorialPrestamos;
use App\Models\VHistorialReservas;
use Illuminate\Support\Facades\DB;

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
            'detalles' => 'required|array|min:1',
            'detalles.*.id_elemento' => 'nullable|exists:inventario,id_elemento',
            'detalles.*.id_stock' => 'nullable|exists:stock_accesorios,id_stock',
            'detalles.*.cantidad' => 'required|integer|min:1'
        ]);

        try {
            $reserva = DB::transaction(function () use ($documento, $validated) {
                // 1. Crear la cabecera
                $reserva = Reserva::create([
                    'documento' => $documento,
                    'Num_estado' => 1, // Pendiente
                    'fecha' => $validated['fecha'],
                    'plazo' => $validated['plazo'] ?? null,
                ]);

                // 2. Crear los detalles y descontar stock
                foreach ($validated['detalles'] as $item) {
                    \App\Models\ReservaDetalle::create([
                        'id_Reserva' => $reserva->id_Reserva,
                        'id_elemento' => $item['id_elemento'] ?? null,
                        'id_stock' => $item['id_stock'] ?? null,
                        'cantidad_solicitada' => $item['cantidad'],
                        'cantidad_entregada' => 0,
                        'cantidad_devuelta' => 0
                    ]);

                    // Descontar la cantidad_disponible física del stock si es un accesorio
                    if (!empty($item['id_stock'])) {
                        $stock = \App\Models\StockAccesorio::find($item['id_stock']);
                        if ($stock) {
                            $stock->decrement('cantidad_disponible', $item['cantidad']);
                            // Descontar también del catálogo global
                            \App\Models\InventarioAccesorio::where('id_accesorio', $stock->id_accesorio)
                                ->decrement('cantidad_disponible', $item['cantidad']);
                        }
                    }
                }

                return $reserva;
            });

            return response()->json([
                'status' => 'success',
                'mensaje' => 'Reserva creada exitosamente',
                'data' => $reserva->load('detalles')
            ], 201);

        } catch (\Exception $e) {
            return response()->json([
                'status' => 'error',
                'mensaje' => 'Error al crear la reserva: ' . $e->getMessage()
            ], 500);
        }
    }

    public function actualizarReserva(Request $request, $id)
    {
        $documento = $request->user()?->documento;
        // Cargamos los detalles para poder devolver el stock antes de actualizar
        $reserva = Reserva::with('detalles')->where('id_Reserva', $id)->where('documento', $documento)->first();
        
        if (!$reserva) {
            return response()->json(['status' => 'error', 'mensaje' => 'Reserva no encontrada'], 404);
        }

        $validated = $request->validate([
            'fecha' => 'sometimes|date',
            'plazo' => 'nullable|date',
            'detalles' => 'sometimes|array|min:1',
            'detalles.*.id_elemento' => 'nullable|exists:inventario,id_elemento',
            'detalles.*.id_stock' => 'nullable|exists:stock_accesorios,id_stock',
            'detalles.*.cantidad' => 'required_with:detalles|integer|min:1'
        ]);

        try {
            DB::transaction(function () use ($reserva, $validated, $request) {
                // Actualizar cabecera
                $reserva->update($request->only(['fecha', 'plazo']));

                // Si envían detalles, hay que devolver los viejos y descontar los nuevos
                if (isset($validated['detalles'])) {
                    
                    // 1. Devolver el stock de los detalles viejos
                    foreach ($reserva->detalles as $viejoDetalle) {
                        if ($viejoDetalle->id_stock) {
                            $stock = \App\Models\StockAccesorio::find($viejoDetalle->id_stock);
                            if ($stock) {
                                $stock->increment('cantidad_disponible', $viejoDetalle->cantidad_solicitada);
                                \App\Models\InventarioAccesorio::where('id_accesorio', $stock->id_accesorio)
                                    ->increment('cantidad_disponible', $viejoDetalle->cantidad_solicitada);
                            }
                        }
                    }

                    // 2. Eliminar los detalles viejos
                    $reserva->detalles()->delete();

                    // 3. Crear los nuevos detalles y descontar el nuevo stock
                    foreach ($validated['detalles'] as $item) {
                        \App\Models\ReservaDetalle::create([
                            'id_Reserva' => $reserva->id_Reserva,
                            'id_elemento' => $item['id_elemento'] ?? null,
                            'id_stock' => $item['id_stock'] ?? null,
                            'cantidad_solicitada' => $item['cantidad'],
                            'cantidad_entregada' => 0,
                            'cantidad_devuelta' => 0
                        ]);

                        if (!empty($item['id_stock'])) {
                            $stock = \App\Models\StockAccesorio::find($item['id_stock']);
                            if ($stock) {
                                $stock->decrement('cantidad_disponible', $item['cantidad']);
                                \App\Models\InventarioAccesorio::where('id_accesorio', $stock->id_accesorio)
                                    ->decrement('cantidad_disponible', $item['cantidad']);
                            }
                        }
                    }
                }
            });

            return response()->json([
                'status' => 'success',
                'mensaje' => 'Reserva actualizada exitosamente',
                'data' => $reserva->load('detalles')
            ]);
        } catch (\Exception $e) {
            return response()->json([
                'status' => 'error',
                'mensaje' => 'Error al actualizar la reserva: ' . $e->getMessage()
            ], 500);
        }
    }

    public function cancelarReserva(Request $request, $id)
    {
        $documento = $request->user()?->documento;
        // Cargamos los detalles para saber qué accesorios devolver a la repisa
        $reserva = Reserva::with('detalles')->where('id_Reserva', $id)->where('documento', $documento)->first();

        if (!$reserva) {
            return response()->json(['status' => 'error', 'mensaje' => 'Reserva no encontrada'], 404);
        }

        try {
            DB::transaction(function () use ($reserva) {
                // Devolver todo el stock a su respectiva ubicación
                foreach ($reserva->detalles as $detalle) {
                    if ($detalle->id_stock) {
                        $stock = \App\Models\StockAccesorio::find($detalle->id_stock);
                        if ($stock) {
                            $stock->increment('cantidad_disponible', $detalle->cantidad_solicitada);
                            \App\Models\InventarioAccesorio::where('id_accesorio', $stock->id_accesorio)
                                ->increment('cantidad_disponible', $detalle->cantidad_solicitada);
                        }
                    }
                }

                // Finalmente, borrar la reserva
                $reserva->delete();
            });

            return response()->json([
                'status' => 'success',
                'mensaje' => 'Reserva cancelada exitosamente'
            ]);
        } catch (\Exception $e) {
            return response()->json([
                'status' => 'error',
                'mensaje' => 'Error al cancelar la reserva: ' . $e->getMessage()
            ], 500);
        }
    }
}