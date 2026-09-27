<?php

namespace App\Http\Controllers;

use App\Models\Reserva;
use App\Traits\ApiResponse;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\DB;

class ReservaController extends Controller
{
    use ApiResponse;

    public function index(Request $request)
    {
        $perPage = min($request->get('per_page', 10), 100);
        $page = $request->get('page', 1);

        $query = Reserva::with('usuario', 'estado');

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

        return $this->paginatedResponse($reserva, 'Reservas obtenidas correctamente');
    }

    public function store(Request $request) {
        $validated = $request->validate([
            'documento' => 'required|exists:usuario,documento',
            'Num_estado' => 'required|exists:estado_reserva,Num_estado',
            'fecha' => 'required|date',
            'plazo' => 'nullable|date|after:fecha',
            'detalles' => 'required|array|min:1',
            'detalles.*.id_elemento' => 'nullable|exists:inventario,id_elemento',
            'detalles.*.id_stock' => 'nullable|exists:stock_accesorios,id_stock',
            'detalles.*.cantidad' => 'required|integer|min:1'
        ]);

        try {
            $reserva = DB::transaction(function () use ($validated) {
                $reserva = Reserva::create([
                    'documento' => $validated['documento'],
                    'Num_estado' => $validated['Num_estado'],
                    'fecha' => $validated['fecha'],
                    'plazo' => $validated['plazo'] ?? null,
                ]);

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
                            // CORRECCIÓN: Validación estricta de stock antes de descontar
                            if ($stock->cantidad_disponible < $item['cantidad']) {
                                throw new \Exception("Stock insuficiente para el accesorio en bodega. Solicitado: {$item['cantidad']}, Disponible: {$stock->cantidad_disponible}");
                            }
                            
                            $stock->decrement('cantidad_disponible', $item['cantidad']);
                            \App\Models\InventarioAccesorio::where('id_accesorio', $stock->id_accesorio)
                                ->decrement('cantidad_disponible', $item['cantidad']);
                        }
                    }
                }

                return $reserva;
            });

            return $this->successResponse(
                $reserva->load('usuario', 'estado', 'detalles.elemento', 'detalles.stock.accesorio'),
                'Reserva creada correctamente',
                201
            );
        } catch (\Exception $e) {
            // Si la validación de stock falla, caerá aquí y la transacción (DB::transaction) revertirá los INSERTs automáticamente
            return $this->errorResponse(
                'Error al crear reserva: ' . $e->getMessage(),
                500
            );
        }
    }

    public function entregarPrestamo(Request $request, $idReserva)
    {
        $reserva = Reserva::with('detalles')->find($idReserva);
        if (!$reserva) {
            return $this->notFoundResponse('Reserva');
        }

        try {
            DB::transaction(function () use ($reserva) {
                \App\Models\Prestamo::updateOrCreate(
                    ['id_Reserva' => $reserva->id_Reserva],
                    [
                        'cod_estado_prestamo' => 2,
                        'fecha_inicio' => now()->toDateString(),
                        'fecha_entrega_original' => $reserva->plazo ?? now()->addDays(3)->toDateString(),
                        'fecha_limite_actual' => $reserva->plazo ?? now()->addDays(3)->toDateString(),
                        'extension_aprobada' => false
                    ]
                );

                $reserva->update(['Num_estado' => 2]);

                foreach ($reserva->detalles as $detalle) {
                    $detalle->update([
                        'cantidad_entregada' => $detalle->cantidad_solicitada
                    ]);

                    if ($detalle->id_elemento) {
                        \App\Models\Inventario::where('id_elemento', $detalle->id_elemento)
                            ->update(['cod_estado_elemento' => 2]); 
                    }
                }
            });

            return $this->successResponse(null, 'Préstamo entregado y equipos despachados exitosamente');
        } catch (\Exception $e) {
            return $this->errorResponse('Error al procesar la entrega: ' . $e->getMessage(), 500);
        }
    }

    public function devolverParcial(Request $request, $idDetalle)
    {
        $validated = $request->validate([
            'cantidad_a_devolver' => 'required|integer|min:1',
            'estado_devolucion' => 'required|integer|in:1,3,4'
        ]);

        $detalle = \App\Models\ReservaDetalle::find($idDetalle);
        if (!$detalle) {
            return $this->notFoundResponse('Detalle de reserva');
        }

        try {
            DB::transaction(function () use ($detalle, $validated) {
                $cantDevueltaNueva = $detalle->cantidad_devuelta + $validated['cantidad_a_devolver'];
                
                if ($cantDevueltaNueva > $detalle->cantidad_entregada) {
                    throw new \Exception('No puedes devolver más cantidad de la que fue entregada.');
                }

                $detalle->update([
                    'cantidad_devuelta' => $cantDevueltaNueva
                ]);

                if ($detalle->id_elemento) {
                    \App\Models\Inventario::where('id_elemento', $detalle->id_elemento)
                        ->update(['cod_estado_elemento' => $validated['estado_devolucion']]);
                } elseif ($detalle->id_stock) {
                    $stock = \App\Models\StockAccesorio::find($detalle->id_stock);
                    if ($stock) {
                        $stock->increment('cantidad_disponible', $validated['cantidad_a_devolver']);
                        \App\Models\InventarioAccesorio::where('id_accesorio', $stock->id_accesorio)
                            ->increment('cantidad_disponible', $validated['cantidad_a_devolver']);
                    }
                }

                $reservaId = $detalle->id_Reserva;
                $pendientes = \App\Models\ReservaDetalle::where('id_Reserva', $reservaId)
                    ->whereRaw('cantidad_devuelta < cantidad_entregada')
                    ->count();

                if ($pendientes === 0) {
                    \App\Models\Prestamo::where('id_Reserva', $reservaId)
                        ->update(['cod_estado_prestamo' => 3]);
                }
            });

            return $this->successResponse(null, 'Devolución registrada correctamente');
        } catch (\Exception $e) {
            return $this->errorResponse('Error en la devolución: ' . $e->getMessage(), 500);
        }
    }

    public function show($id)
    {
        $reserva = Reserva::with('usuario', 'estado', 'detalles.elemento', 'detalles.stock.accesorio', 'prestamo')->find($id);
        if (!$reserva) {
            return $this->notFoundResponse('Reserva');
        }
        return $this->successResponse(
            $reserva,
            'Reserva obtenida correctamente'
        );
    }

    public function update(Request $request, $id)
    {
        $reserva = Reserva::with('detalles')->find($id);
        
        if (!$reserva) {
            return $this->notFoundResponse('Reserva');
        }

        $validated = $request->validate([
            'Num_estado' => 'sometimes|exists:estado_reserva,Num_estado',
            'fecha' => 'sometimes|date',
            'plazo' => 'nullable|date|after:fecha',
            'detalles' => 'sometimes|array|min:1',
            'detalles.*.id_elemento' => 'nullable|exists:inventario,id_elemento',
            'detalles.*.id_stock' => 'nullable|exists:stock_accesorios,id_stock',
            'detalles.*.cantidad' => 'required_with:detalles|integer|min:1'
        ]);

        try {
            DB::transaction(function () use ($reserva, $validated, $request) {
                $reserva->update($request->only(['Num_estado', 'fecha', 'plazo']));

                if (isset($validated['detalles'])) {

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

                    $reserva->detalles()->delete();

                    foreach ($validated['detalles'] as $item) {
                        if (!empty($item['id_stock'])) {
                            $stock = \App\Models\StockAccesorio::find($item['id_stock']);
                            if ($stock) {
                                // CORRECCIÓN: Validación estricta de stock antes de descontar en actualización
                                if ($stock->cantidad_disponible < $item['cantidad']) {
                                    throw new \Exception("Stock insuficiente para actualizar el accesorio. Solicitado: {$item['cantidad']}, Disponible: {$stock->cantidad_disponible}");
                                }
                                $stock->decrement('cantidad_disponible', $item['cantidad']);
                                \App\Models\InventarioAccesorio::where('id_accesorio', $stock->id_accesorio)
                                    ->decrement('cantidad_disponible', $item['cantidad']);
                            }
                        }

                        \App\Models\ReservaDetalle::create([
                            'id_Reserva' => $reserva->id_Reserva,
                            'id_elemento' => $item['id_elemento'] ?? null,
                            'id_stock' => $item['id_stock'] ?? null,
                            'cantidad_solicitada' => $item['cantidad'],
                            'cantidad_entregada' => 0,
                            'cantidad_devuelta' => 0
                        ]);
                    }
                }
            });

            return $this->successResponse(
                $reserva->load('usuario', 'estado', 'detalles.elemento', 'detalles.stock.accesorio'),
                'Reserva actualizada correctamente'
            );
        } catch (\Exception $e) {
            return $this->errorResponse(
                'Error al actualizar reserva: ' . $e->getMessage(),
                500
            );
        }
    }

    public function destroy($id)
    {
        $reserva = Reserva::with('detalles')->find($id);

        if (!$reserva) {
            return $this->notFoundResponse('Reserva');
        }

        try {
            DB::transaction(function () use ($reserva) {
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
                $reserva->delete();
            });

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