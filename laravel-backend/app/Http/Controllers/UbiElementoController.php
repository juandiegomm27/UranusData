<?php

namespace App\Http\Controllers;

use Illuminate\Http\Request;
use App\Models\UbiElemento;
use App\Models\Inventario;
use App\Models\StockAccesorio;

class UbiElementoController extends Controller
{
    public function store(Request $request)
    {
        $request->validate([
            'ubicacion' => 'required|string|max:255',
        ]);

        try {
            $ubicacion = UbiElemento::firstOrCreate(
                ['ubicacion' => trim($request->ubicacion)]
            );

            return response()->json([
                'success' => true,
                'mensaje' => 'Ubicación procesada exitosamente',
                'ubicacion' => $ubicacion
            ], 200);

        } catch (\Exception $e) {
            return response()->json([
                'success' => false,
                'mensaje' => 'Error al guardar la ubicación en la base de datos: ' . $e->getMessage()
            ], 500);
        }
    }

    public function destroy($id)
    {
        try {
            $ubicacion = UbiElemento::find($id);
    
            if (!$ubicacion) {
                return response()->json([
                    'success' => false,
                    'mensaje' => 'La ubicación no existe.'
                ], 404);
            }
    
            // Verificar si hay elementos únicos o accesorios usando esta ubicación
            $tieneElementos = Inventario::where('cod_ubi_elemento', $id)->exists();
            $tieneAccesorios = StockAccesorio::where('cod_ubi_elemento', $id)->exists();
    
            if ($tieneElementos || $tieneAccesorios) {
                return response()->json([
                    'success' => false,
                    'mensaje' => 'No se puede eliminar la ubicación porque hay equipos o accesorios asignados a ella.'
                ], 400);
            }
    
            $ubicacion->delete();
    
            return response()->json([
                'success' => true,
                'mensaje' => 'Ubicación eliminada exitosamente'
            ], 200);
    
        } catch (\Exception $e) {
            return response()->json([
                'success' => false,
                'mensaje' => 'Error al eliminar la ubicación.'
            ], 500);
        }
    }
}