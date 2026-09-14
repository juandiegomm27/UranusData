<?php

namespace App\Http\Controllers;

use App\Models\Inventario;
use App\Models\TipoElemento;
use App\Models\UbiElemento;
use App\Models\EstadoElemento;
use App\Models\Mantenimiento;
use App\Models\TipoMantenimiento;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\DB;

class InventarioController extends Controller
{
    public function index(Request $request)
    {
        $query = Inventario::query();

        if ($request->filled('search')) {
            $searchTerm = '%' . $request->search . '%';
            $query->where(function($q) use ($searchTerm) {
                $q->where('nombre_elemento', 'like', $searchTerm)
                  ->orWhere('serial', 'like', $searchTerm)
                  ->orWhere('modelo', 'like', $searchTerm);
            });
        }

        if ($request->filled('tipo')) {
            $query->where('cod_tipo_elemento', $request->tipo);
        }

        if ($request->filled('estado')) {
            $query->where('cod_estado_elemento', $request->estado);
        }

        if ($request->filled('ubicacion')) {
            $query->where('cod_ubi_elemento', $request->ubicacion);
        }

        // CAPTURAR EL TAMAÑO DE PÁGINA DEL FRONTEND (por defecto 10 si no viene)
        $perPage = $request->input('per_page', 10);
        
        // APLICAR LA PAGINACIÓN DINÁMICA
        $elementos = $query->paginate($perPage);

        return response()->json([
            'success' => true,
            'data' => $elementos->items(),
            'total' => $elementos->total(),
            'last_page' => $elementos->lastPage()
        ]);
    }

    public function show($id)
    {
        $elemento = Inventario::with(['tipo', 'ubicacion', 'estado', 'mantenimiento.tipo'])->find($id);

        if (!$elemento) {
            return response()->json([
                'success' => false,
                'mensaje' => 'Elemento no encontrado'
            ], 404);
        }

        return response()->json([
            'success' => true,
            'data' => $elemento
        ]);
    }

public function store(Request $request)
    {
        $validated = $request->validate([
            'cod_elemento' => 'nullable|string|max:50|unique:inventario,cod_elemento',
            'nombre_elemento' => 'required|string|max:255',
            'cod_tipo_elemento' => 'required|exists:tipo_elemento,cod_tipo_elemento',
            'cod_ubi_elemento' => 'required|exists:ubi_elemento,cod_ubi_elemento',
            'cod_estado_elemento' => 'nullable|exists:estado_elemento,cod_estado_elemento',
            'serial' => 'nullable|string|max:100|unique:inventario,serial',
            'modelo' => 'nullable|string|max:100',
            'descripcion' => 'nullable|string',
            'cantidad' => 'nullable|integer|min:1'
        ]);

        if (!isset($validated['cod_estado_elemento'])) {
            $validated['cod_estado_elemento'] = 1; 
        }

        $elemento = Inventario::create($validated);

        if (empty($elemento->cod_elemento)) {
            $prefijo = strtoupper(substr(preg_replace('/[^A-Za-z0-9]/', '', $elemento->nombre_elemento), 0, 3));
            $numero = str_pad($elemento->id_elemento, 3, '0', STR_PAD_LEFT);
            $elemento->update(['cod_elemento' => $prefijo . '-' . $numero]);
        }

        return response()->json([
            'success' => true,
            'mensaje' => 'Elemento creado exitosamente',
            'data' => $elemento
        ], 201);
    }

    public function update(Request $request, $id)
    {
        $elemento = Inventario::find($id);

        if (!$elemento) {
            return response()->json([
                'success' => false,
                'mensaje' => 'Elemento no encontrado'
            ], 404);
        }

        $validated = $request->validate([
            'nombre_elemento' => 'string|max:255',
            'cod_tipo_elemento' => 'exists:tipo_elemento,cod_tipo_elemento',
            'cod_ubi_elemento' => 'exists:ubi_elemento,cod_ubi_elemento',
            'cod_estado_elemento' => 'exists:estado_elemento,cod_estado_elemento',
            'cod_elemento' => 'nullable|string|max:50|unique:inventario,cod_elemento,' . $id . ',id_elemento',
            'serial' => 'nullable|string|max:100|unique:inventario,serial,' . $id . ',id_elemento',
            'modelo' => 'nullable|string|max:100',
            'descripcion' => 'nullable|string',
            'cantidad' => 'nullable|integer|min:1'
        ]);

        $elemento->update($validated);

        return response()->json([
            'success' => true,
            'mensaje' => 'Elemento actualizado exitosamente',
            'data' => $elemento
        ]);
    }

    // ELIMINAR ELEMENTO
    public function destroy($id)
    {
        $elemento = Inventario::find($id);

        if (!$elemento) {
            return response()->json([
                'success' => false,
                'mensaje' => 'Elemento no encontrado'
            ], 404);
        }

        $elemento->delete();

        return response()->json([
            'success' => true,
            'mensaje' => 'Elemento eliminado exitosamente'
        ]);
    }

    // OBTENER OPCIONES PARA FILTROS
    public function getOpciones()
    {
        return response()->json([
            'success' => true,
            'tipos' => TipoElemento::all(),
            'ubicaciones' => UbiElemento::all(),
            'estados' => EstadoElemento::all(),
            'tipos_mantenimiento' => TipoMantenimiento::all()
        ]);
    }

    // ENVIAR A MANTENIMIENTO (CORREGIDO PARA EVITAR EL ERROR 1054)
public function enviarMantenimiento(Request $request, $id)
    {
        $elemento = Inventario::find($id);
        if (!$elemento) {
            return response()->json([
                'success' => false,
                'mensaje' => 'Elemento no encontrado'
            ], 404);
        }

        // VALIDACIÓN: Evitar enviar si ya está en mantenimiento (Estado 4)
        if ($elemento->cod_estado_elemento == 4) {
            return response()->json([
                'success' => false,
                'mensaje' => 'Este elemento ya se encuentra en mantenimiento'
            ], 400);
        }

        $validated = $request->validate([
            'cod_tipo_mantenimiento' => 'required|exists:tipo_mantenimiento,cod_tipo_mantenimiento',
            'descripcion' => 'required|string',
            'documento_tecnico' => 'nullable|exists:usuario,documento',
            'observaciones' => 'nullable|string'
        ]);

        $mantenimiento = Mantenimiento::create([
            'documento' => $request->user()?->documento ?? $validated['documento_tecnico'] ?? null,
            'id_elemento' => $elemento->id_elemento, 
            'serial' => $elemento->serial ?? 'N/A', 
            'elemento' => $elemento->nombre_elemento,
            'fecha' => now()->toDateString(),
            'cod_tipo_mantenimiento' => $validated['cod_tipo_mantenimiento'],
            'descripcion' => $validated['descripcion'],
            'cod_estado_mantenimiento' => 1 
        ]);

        $elemento->update(['cod_estado_elemento' => 4]);

        return response()->json([
            'success' => true,
            'mensaje' => 'Elemento enviado a mantenimiento exitosamente',
            'data' => $mantenimiento
        ], 201);
    }

    // OBTENER ELEMENTOS POR TIPO
    public function obtenerElementosPorTipo($tipo)
    {
        $elementos = Inventario::where('cod_tipo_elemento', $tipo)
            ->with(['tipo', 'ubicacion', 'estado'])
            ->get();

        return response()->json([
            'success' => true,
            'data' => $elementos
        ]);
    }

    // EXPORTAR INVENTARIO A CSV
    public function exportarInventario()
    {
        try {
            $elementos = Inventario::with(['tipo', 'ubicacion', 'estado'])->get();

            $filename = 'inventario_' . now()->format('Y-m-d') . '.csv';

            $headers = [
                'Content-Type' => 'text/csv; charset=UTF-8',
                'Content-Disposition' => "attachment; filename=\"$filename\"",
                'Pragma' => 'no-cache',
                'Cache-Control' => 'must-revalidate, post-check=0, pre-check=0',
                'Expires' => '0',
            ];

            $callback = function () use ($elementos) {
                $file = fopen('php://output', 'w');
                fputs($file, "\xEF\xBB\xBF");
                fputcsv($file, ['ID', 'Código', 'Nombre', 'Serial', 'Modelo', 'Tipo', 'Estado', 'Ubicación', 'Cantidad']);

                foreach ($elementos as $item) {
                    fputcsv($file, [
                        $item->id_elemento,
                        $item->cod_elemento ?? '',
                        $item->nombre_elemento,
                        $item->serial ?? '',
                        $item->modelo ?? '',
                        $item->tipo?->tipo ?? '',
                        $item->estado?->estado ?? '',
                        $item->ubicacion?->ubicacion ?? '',
                        $item->cantidad ?? 1
                    ]);
                }
                fclose($file);
            };

            return response()->stream($callback, 200, $headers);
        } catch (\Exception $e) {
            return response()->json([
                'success' => false,
                'mensaje' => 'Error al exportar inventario: ' . $e->getMessage()
            ], 500);
        }
    }

public function historial($id)
    {
        try {
            // Obtenemos directamente los registros de mantenimiento del elemento sin joins complejos
            $historial = DB::table('mantenimiento')
                ->where('id_elemento', $id)
                ->orderBy('id_mantenimiento', 'desc')
                ->get()
                ->map(function ($item) {
                    // Asignamos valores por defecto seguros para la vista
                    $item->tipo = 'Mantenimiento General';
                    $item->estado = $item->cod_estado_mantenimiento == 3 ? 'Completado' : 'Pendiente';
                    return $item;
                });

            return response()->json([
                'success' => true,
                'data' => $historial
            ]);
        } catch (\Exception $e) {
            return response()->json([
                'success' => false,
                'message' => $e->getMessage()
            ], 500);
        }
    }
}