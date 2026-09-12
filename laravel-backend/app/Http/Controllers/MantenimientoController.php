<?php

namespace App\Http\Controllers;

use App\Models\Inventario;
use App\Models\Mantenimiento;
use App\Models\TipoMantenimiento;
use App\Traits\ApiResponse;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\DB;

class MantenimientoController extends Controller
{
    use ApiResponse;

    public function index(Request $request)
    {
        $perPage = min($request->get('per_page', 10), 100);
        $page = $request->get('page', 1);

        $query = Mantenimiento::with('tipo', 'usuario', 'elementoInventario');

        if ($request->filled('busqueda')) {
            $busqueda = $request->get('busqueda');
            $query->where(function ($q) use ($busqueda) {
                $q->where('elemento', 'like', "%$busqueda%")
                  ->orWhere('serial', 'like', "%$busqueda%")
                  ->orWhere('descripcion', 'like', "%$busqueda%");
            });
        }

        if ($request->filled('tipo')) {
            $query->where('cod_tipo_mantenimiento', $request->tipo);
        }

        if ($request->filled('estado')) {
            $query->where('cod_estado_mantenimiento', $request->estado);
        }

        $mantenimientos = $query->orderByDesc('fecha')->paginate($perPage, ['*'], 'page', $page);

        return $this->paginatedResponse($mantenimientos, 'Historial obtenido correctamente');
    }

    public function getOpciones()
    {
        return response()->json([
            'success' => true,
            'tipos_mantenimiento' => TipoMantenimiento::all(),
            'estados_mantenimiento' => DB::table('estado_mantenimiento')->get()
        ]);
    }

    public function enviarMantenimiento(Request $request, $id)
    {
        $elemento = Inventario::find($id);

        if (!$elemento) {
            return response()->json(['success' => false, 'mensaje' => 'Elemento no encontrado'], 404);
        }

        $validated = $request->validate([
            'cod_tipo_mantenimiento' => 'required|integer',
            'descripcion' => 'required|string',
        ]);

        $mantenimiento = Mantenimiento::create([
            'documento' => $request->user()?->documento ?? null,
            'id_elemento' => $elemento->id_elemento,
            'serial' => $elemento->serial ?? 'N/A',
            'elemento' => $elemento->nombre_elemento,
            'fecha' => now()->toDateString(),
            'cod_tipo_mantenimiento' => $validated['cod_tipo_mantenimiento'],
            'descripcion' => $validated['descripcion'],
            'cod_estado_mantenimiento' => 1 
        ]);

        $elemento->update(['cod_estado_elemento' => 4]);

        return response()->json(['success' => true, 'mensaje' => 'Enviado a mantenimiento', 'data' => $mantenimiento]);
    }

    public function completarMantenimiento(Request $request, $id)
    {
        $mantenimiento = Mantenimiento::find($id);

        if (!$mantenimiento) {
            return response()->json(['success' => false, 'mensaje' => 'Mantenimiento no encontrado'], 404);
        }

        $request->validate([
            'observaciones' => 'required|string',
            'cod_estado_mantenimiento' => 'required|integer'
        ]);

        $nuevoEstado = $request->cod_estado_mantenimiento;

        $mantenimiento->update([
            'observaciones' => $request->observaciones,
            'cod_estado_mantenimiento' => $nuevoEstado
        ]);

        if ($mantenimiento->id_elemento) {
            $elementoInventario = Inventario::find($mantenimiento->id_elemento);
            if ($elementoInventario) {
                if ($nuevoEstado == 3) { 
                    $elementoInventario->update(['cod_estado_elemento' => 1]); 
                } else if ($nuevoEstado == 2) { 
                    $elementoInventario->update(['cod_estado_elemento' => 4]); 
                }
            }
        }

        return response()->json(['success' => true, 'mensaje' => "Mantenimiento actualizado"]);
    }
}