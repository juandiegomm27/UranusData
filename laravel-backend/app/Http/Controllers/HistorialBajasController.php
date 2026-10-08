<?php

namespace App\Http\Controllers;

use Illuminate\Database\Eloquent\ModelNotFoundException;
use Illuminate\Http\Request;
use App\Models\HistorialBajaGeneral;
use App\Models\Inventario;
use App\Models\InventarioAccesorio;
use App\Models\StockAccesorio;
use Illuminate\Support\Facades\DB;
use App\Models\UbiElemento;

class HistorialBajasController extends Controller
{
    public function index(Request $request)
    {
        $query = HistorialBajaGeneral::query();

        if ($request->filled('tipo')) {
            $query->where('tipo_item', $request->tipo);
        }

        $resumen = [
            'registros' => (clone $query)->count(),
            'unidades' => (int) (clone $query)->sum('cantidad'),
        ];

        $bajas = $query->orderBy('fecha_baja', 'desc')
            ->orderByDesc('id_baja')
            ->paginate(15);

        return response()->json([
            'success' => true,
            'data' => $bajas,
            'resumen' => $resumen
        ]);
    }

    public function darDeBajaAccesorio($id_stock, Request $request)
    {
        $request->validate([
            'cantidad' => 'required|integer|min:1',
            'motivo' => 'nullable|string|max:255'
        ]);

        DB::beginTransaction();
        try {
            $stock = StockAccesorio::with(['accesorio', 'ubicacion'])->findOrFail($id_stock);
            $cantidadDarBaja = $request->input('cantidad');

            if ($cantidadDarBaja > $stock->cantidad_disponible) {
                DB::rollBack();
                return response()->json([
                    'success' => false,
                    'mensaje' => 'No puedes dar de baja más unidades de las que hay disponibles en esta ubicación.'
                ], 422);
            }

            HistorialBajaGeneral::create([
                'tipo_item' => 'accesorio',
                'id_original' => $stock->id_stock,
                'id_accesorio' => $stock->id_accesorio,
                'nombre' => $stock->accesorio->nombre,
                'codigo_identificacion' => 'STOCK-' . $stock->id_stock,
                'cantidad' => $cantidadDarBaja,
                'cod_ubi_elemento' => $stock->cod_ubi_elemento,
                'ubicacion' => $stock->ubicacion ? $stock->ubicacion->ubicacion : 'N/A',
                'motivo' => $request->input('motivo', 'Baja de unidades de accesorio')
            ]);

            $stock->cantidad_total -= $cantidadDarBaja;
            $stock->cantidad_disponible -= $cantidadDarBaja;
            $stock->save();

            $accesorioGlobal = $stock->accesorio;
            $accesorioGlobal->cantidad_total -= $cantidadDarBaja;
            $accesorioGlobal->cantidad_disponible -= $cantidadDarBaja;
            $accesorioGlobal->save();

            DB::commit();
            return response()->json([
                'success' => true,
                'mensaje' => 'Unidades dadas de baja correctamente.'
            ]);
        } catch (ModelNotFoundException $e) {
            DB::rollBack();
            return response()->json([
                'success' => false,
                'mensaje' => 'El lote de stock no existe.'
            ], 404);
        } catch (\Exception $e) {
            DB::rollBack();
            return response()->json([
                'success' => false,
                'mensaje' => 'Error al procesar la baja: ' . $e->getMessage()
            ], 500);
        }
    }

    public function restaurar($id)
    {
        DB::beginTransaction();
        try {
            $baja = HistorialBajaGeneral::findOrFail($id);

            if ($baja->tipo_item === 'activo') {
                $activo = Inventario::find($baja->id_original);
                if (!$activo) {
                    DB::rollBack();
                    return response()->json([
                        'success' => false,
                        'mensaje' => 'El equipo ya no existe en el inventario.'
                    ], 404);
                }

                $activo->cod_estado_elemento = Inventario::ESTADO_ACTIVO;
                $activo->save();
            } else {
                $stock = $this->ubicarStockParaRestaurar($baja);

                if (!$stock) {
                    DB::rollBack();
                    return response()->json([
                        'success' => false,
                        'mensaje' => 'No se puede restaurar: el accesorio, su ubicación o su lote ya no existen.'
                    ], 422);
                }

                $stock->cantidad_total += $baja->cantidad;
                $stock->cantidad_disponible += $baja->cantidad;
                $stock->save();

                $accesorio = InventarioAccesorio::find($stock->id_accesorio);
                if ($accesorio) {
                    $accesorio->cantidad_total += $baja->cantidad;
                    $accesorio->cantidad_disponible += $baja->cantidad;
                    $accesorio->save();
                }
            }

            $baja->delete();
            DB::commit();
            return response()->json(['success' => true, 'mensaje' => 'Elemento restaurado exitosamente al inventario.']);
        } catch (ModelNotFoundException $e) {
            DB::rollBack();
            return response()->json(['success' => false, 'mensaje' => 'El registro de baja no existe.'], 404);
        } catch (\Exception $e) {
            DB::rollBack();
            return response()->json(['success' => false, 'mensaje' => 'Error al restaurar: ' . $e->getMessage()], 500);
        }
    }

    public function darDeBajaActivo($id, Request $request)
    {
        $request->validate([
            'motivo' => 'nullable|string|max:255'
        ]);

        $activo = Inventario::with(['ubicacion', 'tipo'])->find($id);

        if (!$activo) {
            return response()->json([
                'success' => false,
                'mensaje' => 'Activo no encontrado.'
            ], 404);
        }

        if ($activo->cod_estado_elemento == Inventario::ESTADO_BAJA) {
            return response()->json([
                'success' => false,
                'mensaje' => 'Este activo ya se encuentra dado de baja.'
            ], 422);
        }

        if ($activo->cod_estado_elemento == Inventario::ESTADO_EN_PRESTAMO) {
            return response()->json([
                'success' => false,
                'mensaje' => 'No puedes dar de baja un activo que está en préstamo. Registra primero su devolución.'
            ], 422);
        }

        if ($activo->cod_estado_elemento == Inventario::ESTADO_MANTENIMIENTO) {
            return response()->json([
                'success' => false,
                'mensaje' => 'Este equipo está en mantenimiento. Finaliza el mantenimiento o dalo de baja desde el módulo de Mantenimiento.'
            ], 422);
        }

        if ($idReserva = $activo->reservaPendiente()) {
            return response()->json([
                'success' => false,
                'mensaje' => "Este equipo tiene la reserva #{$idReserva} pendiente de entrega. Entrégala o pide al docente que la cancele antes de darlo de baja."
            ], 422);
        }

        try {
            DB::transaction(function () use ($activo, $request) {
                HistorialBajaGeneral::create([
                    'tipo_item' => 'activo',
                    'id_original' => $activo->id_elemento,
                    'nombre' => $activo->nombre_elemento,
                    'codigo_identificacion' => $activo->cod_elemento ?? ('EQ-' . $activo->id_elemento),
                    'modelo' => $activo->modelo,
                    'descripcion' => $activo->descripcion,
                    'cantidad' => 1,
                    'cod_tipo_elemento' => $activo->cod_tipo_elemento,
                    'cod_ubi_elemento' => $activo->cod_ubi_elemento,
                    'ubicacion' => $activo->ubicacion ? $activo->ubicacion->ubicacion : 'N/A',
                    'motivo' => $request->input('motivo', 'Baja de activo fijo')
                ]);

                $activo->motivoMovimiento = $request->input('motivo');
                $activo->cod_estado_elemento = Inventario::ESTADO_BAJA;
                $activo->save();
            });

            return response()->json([
                'success' => true,
                'mensaje' => 'Activo fijo dado de baja correctamente.'
            ]);
        } catch (\Exception $e) {
            return response()->json([
                'success' => false,
                'mensaje' => 'Error al procesar la baja del activo: ' . $e->getMessage()
            ], 500);
        }
    }

    private function ubicarStockParaRestaurar(HistorialBajaGeneral $baja): ?StockAccesorio
    {
        if ($baja->id_accesorio && $baja->cod_ubi_elemento) {
            $existen = InventarioAccesorio::whereKey($baja->id_accesorio)->exists()
                && UbiElemento::whereKey($baja->cod_ubi_elemento)->exists();

            if (!$existen) {
                return null;
            }

            return StockAccesorio::firstOrCreate(
                ['id_accesorio' => $baja->id_accesorio, 'cod_ubi_elemento' => $baja->cod_ubi_elemento],
                ['cantidad_total' => 0, 'cantidad_disponible' => 0]
            );
        }

        return StockAccesorio::find($baja->id_original);
    }
}
