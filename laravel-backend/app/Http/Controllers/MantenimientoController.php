<?php

namespace App\Http\Controllers;

use App\Models\Mantenimiento;
use Illuminate\Http\Request;

class MantenimientoController extends Controller
{
    public function index()
    {
        return response()->json(
            Mantenimiento::with('usuario', 'tipo', 'inventario')->get()
        );
    }

    public function show($id)
    {
        $mantenimiento = Mantenimiento::with('usuario', 'tipo', 'inventario')->find($id);
        if (!$mantenimiento) {
            return response()->json(['status' => 'error', 'mensaje' => 'Mantenimiento no encontrado'], 404);
        }
        return response()->json($mantenimiento);
    }

    public function store(Request $request)
    {
        $validated = $request->validate([
            'id_elemento' => 'required|exists:inventario,id_elemento',
            'cod_elemento' => 'required|string',
            'tipo_cod_tipo' => 'required|exists:tipo_mantenimiento,cod_tipo',
            'documento' => 'required|exists:usuario,documento',
            'descripcion' => 'nullable|string'
        ]);

        $mantenimiento = Mantenimiento::create($validated);
        return response()->json(['status' => 'success', 'mantenimiento' => $mantenimiento], 201);
    }

    public function update(Request $request, $id)
    {
        $mantenimiento = Mantenimiento::find($id);
        if (!$mantenimiento) {
            return response()->json(['status' => 'error', 'mensaje' => 'Mantenimiento no encontrado'], 404);
        }

        $mantenimiento->update($request->only(['tipo_cod_tipo', 'descripcion']));
        return response()->json(['status' => 'success', 'mantenimiento' => $mantenimiento]);
    }

    public function destroy($id)
    {
        $mantenimiento = Mantenimiento::find($id);
        if (!$mantenimiento) {
            return response()->json(['status' => 'error', 'mensaje' => 'Mantenimiento no encontrado'], 404);
        }

        $mantenimiento->delete();
        return response()->json(['status' => 'success', 'mensaje' => 'Mantenimiento eliminado']);
    }
}