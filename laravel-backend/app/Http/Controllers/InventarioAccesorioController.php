<?php

namespace App\Http\Controllers;

use App\Models\InventarioAccesorio;
use App\Models\StockAccesorio;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\DB;

class InventarioAccesorioController extends Controller
{
    public function index(Request $request)
    {
        $perPage = $request->input('per_page', 10);
        $query = InventarioAccesorio::with(['tipo', 'stocks.ubicacion']);

        if ($request->filled('search')) {
            $searchTerm = '%' . $request->search . '%';
            $query->where('nombre', 'like', $searchTerm)
                  ->orWhere('modelo', 'like', $searchTerm)
                  ->orWhere('descripcion', 'like', $searchTerm);
        }

        if ($request->filled('ubicacion')) {
            $query->whereHas('stocks', function ($q) use ($request) {
                $q->where('cod_ubi_elemento', $request->ubicacion);
            });
        }

        $accesorios = $query->paginate($perPage);

        return response()->json([
            'success' => true,
            'data' => $accesorios->items(),
            'total' => $accesorios->total(),
            'last_page' => $accesorios->lastPage()
        ]);
    }

    public function store(Request $request)
    {
        // 1. Añadimos 'id_accesorio' a las validaciones permitidas
        $validated = $request->validate([
            'id_accesorio' => 'nullable|exists:inventario_accesorios,id_accesorio',
            'nombre' => 'required|string|max:255',
            'modelo' => 'nullable|string|max:100',
            'descripcion' => 'nullable|string',
            'cod_tipo_elemento' => 'nullable|exists:tipo_elemento,cod_tipo_elemento',
            'cantidad_total' => 'required|integer|min:1',
            'cod_ubi_elemento' => 'required|exists:ubi_elemento,cod_ubi_elemento'
        ]);

        DB::beginTransaction();
        try {
            // 2. Comprobamos si nos enviaron un ID (significa que el accesorio ya existe)
            if ($request->has('id_accesorio') && !empty($request->id_accesorio)) {
                
                $accesorio = InventarioAccesorio::findOrFail($request->id_accesorio);
                
                // Actualizamos las cantidades globales del catálogo de este accesorio
                $accesorio->cantidad_total += $validated['cantidad_total'];
                $accesorio->cantidad_disponible += $validated['cantidad_total'];
                $accesorio->save();

                // Buscamos si ya hay stock de este accesorio en la ubicación indicada
                $stock = StockAccesorio::firstOrNew([
                    'id_accesorio' => $accesorio->id_accesorio,
                    'cod_ubi_elemento' => $validated['cod_ubi_elemento']
                ]);

                // Le sumamos la cantidad (si era nuevo, empezará en 0 antes de sumar)
                $stock->cantidad_total += $validated['cantidad_total'];
                $stock->cantidad_disponible += $validated['cantidad_total'];
                $stock->save();

                $mensaje = 'Stock añadido al accesorio existente exitosamente';
                
            } else {
                // 3. Lógica original: Crear un accesorio completamente nuevo
                $accesorio = InventarioAccesorio::create([
                    'nombre' => $validated['nombre'],
                    'modelo' => $validated['modelo'] ?? null,
                    'descripcion' => $validated['descripcion'] ?? null,
                    'cod_tipo_elemento' => $validated['cod_tipo_elemento'] ?? null,
                    'cantidad_total' => $validated['cantidad_total'],
                    'cantidad_disponible' => $validated['cantidad_total']
                ]);

                StockAccesorio::create([
                    'id_accesorio' => $accesorio->id_accesorio,
                    'cod_ubi_elemento' => $validated['cod_ubi_elemento'],
                    'cantidad_total' => $validated['cantidad_total'],
                    'cantidad_disponible' => $validated['cantidad_total']
                ]);

                $mensaje = 'Accesorio y stock inicial creados exitosamente';
            }

            DB::commit();
            return response()->json([
                'success' => true,
                'mensaje' => $mensaje,
                'data' => $accesorio->load('stocks.ubicacion')
            ], 201);
            
        } catch (\Exception $e) {
            DB::rollBack();
            return response()->json(['success' => false, 'mensaje' => $e->getMessage()], 500);
        }
    }

    public function update(Request $request, $id)
    {
        $accesorio = InventarioAccesorio::find($id);

        if (!$accesorio) {
            return response()->json(['success' => false, 'mensaje' => 'Accesorio no encontrado'], 404);
        }

        $validated = $request->validate([
            'nombre' => 'string|max:255',
            'modelo' => 'nullable|string|max:100',
            'descripcion' => 'nullable|string',
            'cod_tipo_elemento' => 'nullable|exists:tipo_elemento,cod_tipo_elemento'
        ]);

        $accesorio->update($validated);

        return response()->json([
            'success' => true,
            'mensaje' => 'Información del accesorio actualizada',
            'data' => $accesorio
        ]);
    }

    public function trasladar(Request $request)
    {
        $validated = $request->validate([
            'id_stock_origen' => 'required|exists:stock_accesorios,id_stock',
            'cod_ubi_destino' => 'required|exists:ubi_elemento,cod_ubi_elemento',
            'cantidad' => 'required|integer|min:1'
        ]);

        DB::beginTransaction();
        try {
            $stockOrigen = StockAccesorio::findOrFail($validated['id_stock_origen']);

            if ($stockOrigen->cantidad_disponible < $validated['cantidad']) {
                throw new \Exception("No hay suficiente cantidad disponible en el origen para trasladar.");
            }

            $stockOrigen->cantidad_total -= $validated['cantidad'];
            $stockOrigen->cantidad_disponible -= $validated['cantidad'];
            $stockOrigen->save();

            $stockDestino = StockAccesorio::firstOrNew([
                'id_accesorio' => $stockOrigen->id_accesorio,
                'cod_ubi_elemento' => $validated['cod_ubi_destino']
            ]);

            $stockDestino->cantidad_total += $validated['cantidad'];
            $stockDestino->cantidad_disponible += $validated['cantidad'];
            $stockDestino->save();
            
            if ($stockOrigen->cantidad_total == 0 && $stockOrigen->cantidad_disponible == 0) {
                $stockOrigen->delete();
            }

            DB::commit();
            return response()->json([
                'success' => true,
                'mensaje' => 'Traslado de stock realizado con éxito.'
            ]);
        } catch (\Exception $e) {
            DB::rollBack();
            return response()->json(['success' => false, 'mensaje' => $e->getMessage()], 400);
        }
    }

    public function destroy($id)
    {
        $accesorio = InventarioAccesorio::find($id);
        if (!$accesorio) {
            return response()->json(['success' => false, 'mensaje' => 'Accesorio no encontrado'], 404);
        }
        $accesorio->delete();
        return response()->json(['success' => true, 'mensaje' => 'Accesorio eliminado del catálogo general']);
    }
}