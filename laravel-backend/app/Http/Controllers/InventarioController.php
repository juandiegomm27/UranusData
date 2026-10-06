<?php

namespace App\Http\Controllers;

use App\Models\Inventario;
use App\Models\InventarioMovimiento;
use App\Models\Marca;
use App\Models\TipoElemento;
use App\Models\UbiElemento;
use App\Models\EstadoElemento;
use App\Models\Mantenimiento;
use App\Models\TipoMantenimiento;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\DB;

class InventarioController extends Controller
{
    private const MENSAJES_VALIDACION = [
        'serial.unique' => 'Ya existe un elemento con ese serial.',
        'cod_cod_elemento.unique' => 'Ya existe un elemento con ese código.',
        'cod_elemento.unique' => 'Ya existe un elemento con ese código.',
        'id_elemento_padre.exists' => 'El elemento principal seleccionado no existe.',
        'cod_marca.exists' => 'La marca seleccionada no existe.',
    ];

    public function index(Request $request)
    {
        $query = Inventario::visibles()
            ->with(['padre:id_elemento,cod_elemento,nombre_elemento', 'marca:cod_marca,marca'])
            ->withCount(['hijos' => fn($q) => $q->visibles()]);

        if ($request->filled('search')) {
            $searchTerm = '%' . $request->search . '%';
            $query->where(function ($q) use ($searchTerm) {
                $q->where('nombre_elemento', 'like', $searchTerm)
                    ->orWhere('cod_elemento', 'like', $searchTerm)
                    ->orWhere('serial', 'like', $searchTerm)
                    ->orWhere('modelo', 'like', $searchTerm)
                    ->orWhereHas('marca', fn($m) => $m->where('marca', 'like', $searchTerm));
            });
        }
        if ($request->filled('tipo')) {
            $query->where('cod_tipo_elemento', $request->tipo);
        }
        if ($request->filled('marca')) {
            $query->where('cod_marca', $request->marca);
        }
        if ($request->filled('estado')) {
            $query->where('cod_estado_elemento', $request->estado);
        }
        if ($request->filled('ubicacion')) {
            $query->where('cod_ubi_elemento', $request->ubicacion);
        }
        // Solo elementos principales (que no son componente de otro): para elegir un padre
        if ($request->boolean('principales')) {
            $query->whereNull('id_elemento_padre');
        }

        $perPage = min((int) $request->input('per_page', 10), 100);
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
        $elemento = Inventario::with([
            'tipo',
            'marca',
            'ubicacion',
            'estado',
            'mantenimiento.tipo',
            'padre:id_elemento,cod_elemento,nombre_elemento',
            'hijos' => fn($q) => $q->visibles()->select(
                'id_elemento',
                'id_elemento_padre',
                'cod_elemento',
                'nombre_elemento',
                'serial'
            ),
        ])->find($id);

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
            'cod_elemento' => 'nullable|string|max:45|unique:inventario,cod_elemento',
            'nombre_elemento' => 'required|string|max:100',
            'cod_tipo_elemento' => 'required|exists:tipo_elemento,cod_tipo_elemento',
            'cod_marca' => 'nullable|integer|exists:marca,cod_marca',
            'cod_ubi_elemento' => 'required|exists:ubi_elemento,cod_ubi_elemento',
            'serial' => 'nullable|string|max:100|unique:inventario,serial',
            'modelo' => 'nullable|string|max:100',
            'descripcion' => 'nullable|string',
            'id_elemento_padre' => ['nullable', 'integer', 'exists:inventario,id_elemento', $this->reglaPadre(null)]
        ], self::MENSAJES_VALIDACION);

        // Un elemento nuevo siempre nace disponible; los demás estados se alcanzan por su flujo
        $validated['cod_estado_elemento'] = Inventario::ESTADO_ACTIVO;

        $elemento = Inventario::create($validated);

        if (empty($elemento->cod_elemento)) {
            $elemento->update(['cod_elemento' => $this->generarCodigo($elemento)]);
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

        // El estado NO se edita aquí: cambia solo por préstamo, mantenimiento o baja
        $validated = $request->validate([
            'nombre_elemento' => 'string|max:100',
            'cod_tipo_elemento' => 'exists:tipo_elemento,cod_tipo_elemento',
            'cod_marca' => 'nullable|integer|exists:marca,cod_marca',
            'cod_ubi_elemento' => 'exists:ubi_elemento,cod_ubi_elemento',
            'cod_elemento' => 'nullable|string|max:45|unique:inventario,cod_elemento,' . $id . ',id_elemento',
            'serial' => 'nullable|string|max:100|unique:inventario,serial,' . $id . ',id_elemento',
            'modelo' => 'nullable|string|max:100',
            'descripcion' => 'nullable|string',
            'id_elemento_padre' => ['nullable', 'integer', 'exists:inventario,id_elemento', $this->reglaPadre($elemento)]
        ], self::MENSAJES_VALIDACION);

        $elemento->update($validated);

        return response()->json([
            'success' => true,
            'mensaje' => 'Elemento actualizado exitosamente',
            'data' => $elemento
        ]);
    }

    // OBTENER OPCIONES PARA FILTROS
    public function getOpciones()
    {
        return response()->json([
            'success' => true,
            'tipos' => TipoElemento::all(),
            'marcas' => Marca::orderBy('marca')->get(),
            'ubicaciones' => UbiElemento::all(),
            // "Baja" no es un filtro útil: esos elementos no se listan en el inventario
            'estados' => EstadoElemento::where('cod_estado_elemento', '!=', Inventario::ESTADO_BAJA)->get(),
            'tipos_mantenimiento' => TipoMantenimiento::all()
        ]);
    }

    // ENVIAR A MANTENIMIENTO
    public function enviarMantenimiento(Request $request, $id)
    {
        $elemento = Inventario::find($id);
        if (!$elemento) {
            return response()->json([
                'success' => false,
                'mensaje' => 'Elemento no encontrado'
            ], 404);
        }

        if ($elemento->cod_estado_elemento != Inventario::ESTADO_ACTIVO) {
            return response()->json([
                'success' => false,
                'mensaje' => 'Solo los elementos activos pueden enviarse a mantenimiento'
            ], 400);
        }

        if ($idReserva = $elemento->reservaPendiente()) {
            return response()->json([
                'success' => false,
                'mensaje' => "Este equipo tiene la reserva #{$idReserva} pendiente de entrega. Entrégala o pide al docente que la cancele antes de enviarlo a mantenimiento."
            ], 422);
        }

        $validated = $request->validate([
            'cod_tipo_mantenimiento' => 'required|exists:tipo_mantenimiento,cod_tipo_mantenimiento',
            'descripcion' => 'required|string',
            'documento_tecnico' => 'nullable|exists:usuario,documento',
            'observaciones' => 'nullable|string'
        ]);

        $mantenimiento = DB::transaction(function () use ($request, $elemento, $validated) {
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

            $elemento->update(['cod_estado_elemento' => Inventario::ESTADO_MANTENIMIENTO]);

            return $mantenimiento;
        });

        return response()->json([
            'success' => true,
            'mensaje' => 'Elemento enviado a mantenimiento exitosamente',
            'data' => $mantenimiento
        ], 201);
    }

    // OBTENER ELEMENTOS POR TIPO
    public function obtenerElementosPorTipo($tipo)
    {
        $elementos = Inventario::visibles()
            ->where('cod_tipo_elemento', $tipo)
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
            $elementos = Inventario::with(['tipo', 'marca', 'ubicacion', 'estado', 'padre'])->get();

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
                fputcsv($file, [
                    'ID',
                    'Código',
                    'Nombre',
                    'Marca',
                    'Serial',
                    'Modelo',
                    'Tipo',
                    'Estado',
                    'Ubicación',
                    'Pertenece a'
                ]);

                foreach ($elementos as $item) {
                    fputcsv($file, [
                        $item->id_elemento,
                        $item->cod_elemento ?? '',
                        $item->nombre_elemento,
                        $item->marca?->marca ?? '',
                        $item->serial ?? '',
                        $item->modelo ?? '',
                        $item->tipo?->tipo ?? '',
                        $item->estado?->estado ?? '',
                        $item->ubicacion?->ubicacion ?? '',
                        $item->padre?->cod_elemento ?? ''
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

    // HISTORIAL DE MANTENIMIENTO DE UN ELEMENTO
    public function historial($id)
    {
        try {
            $historial = DB::table('mantenimiento as m')
                ->leftJoin('tipo_mantenimiento as t', 'm.cod_tipo_mantenimiento', '=', 't.cod_tipo_mantenimiento')
                ->leftJoin('estado_mantenimiento as e', 'm.cod_estado_mantenimiento', '=', 'e.cod_estado_mantenimiento')
                ->where('m.id_elemento', $id)
                ->orderByDesc('m.id_mantenimiento')
                ->select('m.*', 't.tipo as tipo', 'e.estado as estado')
                ->get();

            return response()->json([
                'success' => true,
                'data' => $historial
            ]);
        } catch (\Exception $e) {
            return response()->json([
                'success' => false,
                'mensaje' => $e->getMessage()
            ], 500);
        }
    }

    // MOVIMIENTOS (HISTORIAL) DE UN ELEMENTO
    public function movimientos(Request $request, $id)
    {
        if (!Inventario::whereKey($id)->exists()) {
            return response()->json([
                'success' => false,
                'mensaje' => 'Elemento no encontrado'
            ], 404);
        }

        $perPage = min((int) $request->input('per_page', 10), 50);
        $movimientos = InventarioMovimiento::where('id_elemento', $id)
            ->orderByDesc('id_movimiento')
            ->paginate($perPage);

        return response()->json([
            'success' => true,
            'data' => $movimientos->items(),
            'total' => $movimientos->total(),
            'last_page' => $movimientos->lastPage()
        ]);
    }

    // Regla de validación del elemento principal: un solo nivel, sin ciclos, sin bajas
    private function reglaPadre(?Inventario $elemento): \Closure
    {
        return function (string $atributo, mixed $valor, \Closure $fail) use ($elemento) {
            if (!$valor) {
                return;
            }

            $padre = Inventario::find($valor);
            if (!$padre) {
                return;
            }

            if ($elemento && $padre->id_elemento == $elemento->id_elemento) {
                $fail('Un elemento no puede pertenecer a sí mismo.');
                return;
            }
            if ($padre->cod_estado_elemento == Inventario::ESTADO_BAJA) {
                $fail('El elemento principal está dado de baja.');
                return;
            }
            if ($padre->id_elemento_padre) {
                $fail('El elemento principal ya es componente de otro. Solo se permite un nivel.');
                return;
            }
            if ($elemento && $elemento->hijos()->exists()) {
                $fail('Este elemento ya tiene componentes, por eso no puede pertenecer a otro.');
            }
        };
    }

    // Código tipo "LAP-005"; si ya existe (por un código manual) agrega un sufijo
    private function generarCodigo(Inventario $elemento): string
    {
        $prefijo = strtoupper(substr(preg_replace('/[^A-Za-z0-9]/', '', $elemento->nombre_elemento), 0, 3)) ?: 'EQ';
        $base = $prefijo . '-' . str_pad($elemento->id_elemento, 3, '0', STR_PAD_LEFT);

        $codigo = $base;
        $n = 1;
        while (Inventario::where('cod_elemento', $codigo)->exists()) {
            $codigo = $base . '-' . $n++;
        }

        return $codigo;
    }
}
