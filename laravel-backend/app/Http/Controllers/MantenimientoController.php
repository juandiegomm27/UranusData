<?php

namespace App\Http\Controllers;

use App\Models\HistorialBajaGeneral;
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

        if ($request->filled('fecha')) {
            $query->whereDate('fecha', $request->fecha);
        }

        $mantenimientos = $query->orderByDesc('fecha')
            ->orderByDesc('id_mantenimiento')
            ->paginate($perPage, ['*'], 'page', $page);

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

    public function completarMantenimiento(Request $request, $id)
    {
        $mantenimiento = Mantenimiento::find($id);

        if (!$mantenimiento) {
            return response()->json(['success' => false, 'mensaje' => 'Mantenimiento no encontrado'], 404);
        }

        if (in_array($mantenimiento->cod_estado_mantenimiento, [3, 4])) {
            return response()->json([
                'success' => false,
                'mensaje' => 'Este mantenimiento ya fue cerrado y no se puede modificar.'
            ], 422);
        }

        $validated = $request->validate([
            'observaciones' => 'required|string',
            'cod_estado_mantenimiento' => 'required|integer|in:2,3,4'
        ]);

        DB::transaction(function () use ($mantenimiento, $validated) {
            $mantenimiento->update([
                'observaciones' => $validated['observaciones'],
                'cod_estado_mantenimiento' => $validated['cod_estado_mantenimiento']
            ]);

            if (!$mantenimiento->id_elemento) {
                return;
            }

            $elemento = Inventario::with(['ubicacion', 'tipo'])->find($mantenimiento->id_elemento);
            if (!$elemento) {
                return;
            }

            if ($validated['cod_estado_mantenimiento'] == 3) {
                // Reparado -> vuelve a estar Activo
                $elemento->update(['cod_estado_elemento' => Inventario::ESTADO_ACTIVO]);
            } elseif ($validated['cod_estado_mantenimiento'] == 4) {
                // Dado de baja -> historial de bajas + estado Baja (el motivo también queda en Movimientos)
                HistorialBajaGeneral::create([
                    'tipo_item' => 'activo',
                    'id_original' => $elemento->id_elemento,
                    'nombre' => $elemento->nombre_elemento,
                    'codigo_identificacion' => $elemento->cod_elemento ?? ('EQ-' . $elemento->id_elemento),
                    'modelo' => $elemento->modelo,
                    'descripcion' => $elemento->descripcion,
                    'cantidad' => 1,
                    'cod_tipo_elemento' => $elemento->cod_tipo_elemento,
                    'cod_ubi_elemento' => $elemento->cod_ubi_elemento,
                    'ubicacion' => $elemento->ubicacion ? $elemento->ubicacion->ubicacion : 'N/A',
                    'motivo' => $validated['observaciones'],
                    'fecha_baja' => now()
                ]);

                $elemento->motivoMovimiento = $validated['observaciones'];
                $elemento->update(['cod_estado_elemento' => Inventario::ESTADO_BAJA]);
            }
        });

        return response()->json([
            'success' => true,
            'mensaje' => 'Mantenimiento actualizado y equipo procesado correctamente.'
        ]);
    }
}