<?php

namespace App\Http\Controllers;

use App\Models\TipoElemento;
use Illuminate\Http\Request;

class TipoElementoController extends Controller
{
    public function store(Request $request)
    {
        $validated = $request->validate([
            'tipo' => 'required|string|max:100|unique:tipo_elemento,tipo'
        ]);

        $tipo = TipoElemento::create($validated);

        return response()->json([
            'success' => true,
            'mensaje' => 'Tipo de elemento creado exitosamente',
            'data' => $tipo
        ], 201);
    }

    public function update(Request $request, $id)
    {
        $tipo = TipoElemento::find($id);

        if (!$tipo) {
            return response()->json(['success' => false, 'mensaje' => 'Tipo no encontrado'], 404);
        }

        $validated = $request->validate([
            'tipo' => 'required|string|max:100|unique:tipo_elemento,tipo,' . $id . ',cod_tipo_elemento'
        ]);

        $tipo->update($validated);

        return response()->json([
            'success' => true,
            'mensaje' => 'Tipo actualizado exitosamente',
            'data' => $tipo
        ]);
    }

    public function destroy($id)
    {
        $tipo = TipoElemento::find($id);

        if (!$tipo) {
            return response()->json(['success' => false, 'mensaje' => 'Tipo no encontrado'], 404);
        }

        try {
            $tipo->delete();
            return response()->json(['success' => true, 'mensaje' => 'Tipo eliminado exitosamente']);
        } catch (\Exception $e) {
            return response()->json([
                'success' => false, 
                'mensaje' => 'No se puede eliminar este tipo porque hay equipos vinculados a él.'
            ], 400);
        }
    }
}