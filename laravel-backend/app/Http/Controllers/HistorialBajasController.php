<?php

namespace App\Http\Controllers;

use Illuminate\Http\Request;
use App\Models\HistorialBajaGeneral;
use App\Models\Inventario;
use App\Models\InventarioAccesorio;
use App\Models\StockAccesorio; // <--- Importación clave añadida
use Illuminate\Support\Facades\DB;

class HistorialBajasController extends Controller
{
    /**
     * Obtener todo el historial de bajas unificado.
     */
    public function index(Request $request)
    {
        $query = HistorialBajaGeneral::orderBy('fecha_baja', 'desc');

        if ($request->has('tipo')) {
            $query->where('tipo_item', $request->tipo);
        }

        $bajas = $query->paginate(15);

        return response()->json([
            'success' => true,
            'data' => $bajas
        ]);
    }

    /**
     * Dar de baja un Accesorio (Desde una ubicación de stock específica).
     */
    public function darDeBajaAccesorio($id_stock, Request $request)
    {
        $request->validate([
            'cantidad' => 'required|integer|min:1',
            'motivo' => 'nullable|string'
        ]);

        DB::beginTransaction();
        try {
            // Buscamos el stock en el salón específico
            $stock = StockAccesorio::with(['accesorio', 'ubicacion'])->findOrFail($id_stock);
            $cantidadDarBaja = $request->input('cantidad');

            if ($cantidadDarBaja > $stock->cantidad_disponible) {
                return response()->json([
                    'success' => false,
                    'mensaje' => 'No puedes dar de baja más unidades de las que hay disponibles en esta ubicación.'
                ], 422);
            }

            // Registrar en el historial general unificado
            HistorialBajaGeneral::create([
                'tipo_item' => 'accesorio',
                'id_original' => $stock->id_stock, // Apunta al lote específico
                'nombre' => $stock->accesorio->nombre,
                'codigo_identificacion' => 'STOCK-' . $stock->id_stock,
                'cantidad' => $cantidadDarBaja,
                'ubicacion' => $stock->ubicacion ? $stock->ubicacion->ubicacion : 'N/A',
                'motivo' => $request->input('motivo', 'Baja de unidades de accesorio')
            ]);

            // Descontar del lote específico (Stock)
            $stock->cantidad_total -= $cantidadDarBaja;
            $stock->cantidad_disponible -= $cantidadDarBaja;
            $stock->save();

            // Descontar del total global (Catálogo)
            $accesorioGlobal = $stock->accesorio;
            $accesorioGlobal->cantidad_total -= $cantidadDarBaja;
            $accesorioGlobal->cantidad_disponible -= $cantidadDarBaja;
            $accesorioGlobal->save();

            DB::commit();
            return response()->json([
                'success' => true,
                'mensaje' => 'Unidades dadas de baja correctamente.'
            ]);
        } catch (\Exception $e) {
            DB::rollBack();
            return response()->json([
                'success' => false,
                'mensaje' => 'Error al procesar la baja: ' . $e->getMessage()
            ], 500);
        }
    }

    /**
     * Restaurar un elemento (Activo o Accesorio) que fue dado de baja.
     */
    public function restaurar($id)
    {
        DB::beginTransaction();
        try {
            $baja = HistorialBajaGeneral::findOrFail($id);

            if ($baja->tipo_item === 'activo') {
                $activo = Inventario::find($baja->id_original);
                if ($activo) {
                    $activo->cod_estado_elemento = 1; // Vuelve a Activo
                    $activo->save();
                }
            } else {
                // Restaurar las cantidades a la ubicación específica (Stock)
                $stock = StockAccesorio::with('accesorio')->find($baja->id_original);
                if ($stock) {
                    $stock->cantidad_total += $baja->cantidad;
                    $stock->cantidad_disponible += $baja->cantidad;
                    $stock->save();

                    // Restaurar también al catálogo global
                    if ($stock->accesorio) {
                        $stock->accesorio->cantidad_total += $baja->cantidad;
                        $stock->accesorio->cantidad_disponible += $baja->cantidad;
                        $stock->accesorio->save();
                    }
                }
            }

            $baja->delete();
            DB::commit();
            return response()->json(['success' => true, 'mensaje' => 'Elemento restaurado exitosamente al inventario.']);
        } catch (\Exception $e) {
            DB::rollBack();
            return response()->json(['success' => false, 'mensaje' => 'Error al restaurar: ' . $e->getMessage()], 500);
        }
    }

    /**
     * Dar de baja un Activo Fijo (Equipo único).
     */
    public function darDeBajaActivo($id, Request $request)
    {
        $request->validate([
            'motivo' => 'nullable|string'
        ]);

        DB::beginTransaction();
        try {
            $activo = Inventario::with(['ubicacion', 'tipo'])->findOrFail($id);

            if ($activo->cod_estado_elemento == 2) {
                return response()->json([
                    'success' => false,
                    'mensaje' => 'Este activo ya se encuentra dado de baja.'
                ], 422);
            }

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

            $activo->cod_estado_elemento = 2; // Estado Dado de Baja
            $activo->save();

            DB::commit();
            return response()->json([
                'success' => true,
                'mensaje' => 'Activo fijo dado de baja correctamente.'
            ]);
        } catch (\Exception $e) {
            DB::rollBack();
            return response()->json([
                'success' => false,
                'mensaje' => 'Error al procesar la baja del activo: ' . $e->getMessage()
            ], 500);
        }
    }
}