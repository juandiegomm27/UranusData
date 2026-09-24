<?php

namespace App\Http\Controllers;

use App\Models\Inventario;
use App\Models\Mantenimiento;
use App\Models\TipoMantenimiento;
use App\Models\HistorialBajaGeneral; // <-- IMPORTACIÓN NECESARIA
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

        $elemento->update(['cod_estado_elemento' => 3]);

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
            'cod_estado_mantenimiento' => 'required|integer|in:2,3,4'
        ]);

        $nuevoEstado = $request->cod_estado_mantenimiento;

        // AUTO-CORRECCIÓN DB: Si el estado 4 no existe, Laravel lo crea automáticamente
        if ($nuevoEstado == 4 && !DB::table('estado_mantenimiento')->where('cod_estado_mantenimiento', 4)->exists()) {
            DB::table('estado_mantenimiento')->insert([
                'cod_estado_mantenimiento' => 4,
                'estado' => 'Dado de baja'
            ]);
        }

        // Ahora guardamos el mantenimiento con el estado correcto (4) garantizado
        $mantenimiento->update([
            'observaciones' => $request->observaciones,
            'cod_estado_mantenimiento' => $nuevoEstado
        ]);

        if ($mantenimiento->id_elemento) {
            $elemento = Inventario::with(['ubicacion', 'tipo'])->find($mantenimiento->id_elemento);
            
            if ($elemento) {
                if ($request->cod_estado_mantenimiento == 3) {
                    // Reparado -> Vuelve a estar Activo (1)
                    $elemento->update(['cod_estado_elemento' => 1]); 
                } 
                elseif ($request->cod_estado_mantenimiento == 4) {
                    // Dado de Baja -> Pasa a estado Inactivo/Baja (2)
                    $elemento->update(['cod_estado_elemento' => 2]); 

                    // Inserción en el Historial General Unificado SIN el prefijo quemado
                    \App\Models\HistorialBajaGeneral::create([
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
                        'motivo' => $request->observaciones, // <--- CORRECCIÓN AQUÍ
                        'fecha_baja' => now()
                    ]);
                }
            }
        }

        return response()->json([
            'success' => true, 
            'mensaje' => "Mantenimiento actualizado y equipo procesado correctamente."
        ]);
    }

    public function completar(Request $request, $id)
    {
        $request->validate([
            'observaciones' => 'required|string',
            'cod_estado_mantenimiento' => 'required|integer|in:2,3,4'
        ]);

        $mantenimiento = Mantenimiento::findOrFail($id);
        $mantenimiento->observaciones = $request->observaciones;
        
        // Salvavidas DB: Si el estado 4 no existe en estado_mantenimiento, cerramos el ticket como 3 (Aprobado) 
        // para evitar el error de llave foránea, pero procesamos la baja física del equipo sin problema.
        $estadoId = $request->cod_estado_mantenimiento;
        if ($estadoId == 4 && !DB::table('estado_mantenimiento')->where('cod_estado_mantenimiento', 4)->exists()) {
            $estadoId = 3; 
        }
        
        $mantenimiento->cod_estado_mantenimiento = $estadoId;
        $mantenimiento->save();

        // Cargamos el elemento y su relación de ubicación
        $elemento = Inventario::with(['ubicacion', 'tipo'])->find($mantenimiento->id_elemento);

        if ($elemento) {
            if ($request->cod_estado_mantenimiento == 3) {
                $elemento->cod_estado_elemento = 1; 
                $elemento->save();
            } 
            elseif ($request->cod_estado_mantenimiento == 4) {
                // Pasamos el equipo físico a Dado de Baja (código 2)
                $elemento->cod_estado_elemento = 2; 
                $elemento->save();

                // INSERCIÓN EXACTA A LA TABLA GENERAL DE BAJAS
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
                    'motivo' => 'Baja desde mantenimiento: ' . $request->observaciones,
                    'fecha_baja' => now()
                ]);
            }
        }

        return response()->json([
            'success' => true, 
            'mensaje' => 'Mantenimiento actualizado y equipo procesado correctamente.'
        ]);
    }
}