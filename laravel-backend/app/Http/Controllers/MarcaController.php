<?php

namespace App\Http\Controllers;

use App\Models\Marca;
use Illuminate\Http\Request;

class MarcaController extends Controller
{
    public function index()
    {
        return response()->json([
            'success' => true,
            'data' => Marca::orderBy('marca')->get()
        ]);
    }

    public function store(Request $request)
    {
        $validated = $request->validate([
            'marca' => 'required|string|max:100|unique:marca,marca'
        ], [
            'marca.unique' => 'Ya existe una marca con ese nombre.'
        ]);

        $marca = Marca::create($validated);

        return response()->json([
            'success' => true,
            'mensaje' => 'Marca creada exitosamente',
            'data' => $marca
        ], 201);
    }

    public function destroy($id)
    {
        $marca = Marca::find($id);

        if (!$marca) {
            return response()->json(['success' => false, 'mensaje' => 'Marca no encontrada'], 404);
        }

        if ($marca->inventario()->exists() || $marca->accesorios()->exists()) {
            return response()->json([
                'success' => false,
                'mensaje' => 'No se puede eliminar esta marca porque hay equipos o repuestos vinculados a ella.'
            ], 400);
        }

        $marca->delete();

        return response()->json([
            'success' => true,
            'mensaje' => 'Marca eliminada exitosamente'
        ]);
    }
}