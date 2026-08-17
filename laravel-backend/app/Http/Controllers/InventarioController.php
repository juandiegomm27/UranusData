<?php

namespace App\Http\Controllers;

use App\Models\Inventario;
use Illuminate\Http\Request;

class InventarioController extends Controller
{
    public function index()
    {
        return response()->json(
            Inventario::with('estado', 'tipo', 'ubicacion')->get()
        );
    }

    public function show($id)
    {
        $inventario = Inventario::with('estado', 'tipo', 'ubicacion')->find($id);
        if (!$inventario) {
            return response()->json(['status' => 'error', 'mensaje' => 'Elemento no encontrado'], 404);
        }
        return response()->json($inventario);
    }

    public function store(Request $request)
    {
        $validated = $request->validate([
            'cod_elemento' => 'required|unique:inventario',
            'No_ubicacion' => 'required|exists:ubi_elemento,cod_ubicacion',
            'cod_tipo' => 'required|exists:tipo_elemento,cod_tipo',
            'cod_estado' => 'required|exists:estado_elemento,cod_estado',
            'marca' => 'nullable|string'
        ]);

        $inventario = Inventario::create($validated);
        return response()->json(['status' => 'success', 'inventario' => $inventario], 201);
    }

    public function update(Request $request, $id)
    {
        $inventario = Inventario::find($id);
        if (!$inventario) {
            return response()->json(['status' => 'error', 'mensaje' => 'Elemento no encontrado'], 404);
        }

        $inventario->update($request->only(['No_ubicacion', 'cod_tipo', 'cod_estado', 'marca']));
        return response()->json(['status' => 'success', 'inventario' => $inventario]);
    }

    public function destroy($id)
    {
        $inventario = Inventario::find($id);
        if (!$inventario) {
            return response()->json(['status' => 'error', 'mensaje' => 'Elemento no encontrado'], 404);
        }

        $inventario->delete();
        return response()->json(['status' => 'success', 'mensaje' => 'Elemento eliminado']);
    }
}