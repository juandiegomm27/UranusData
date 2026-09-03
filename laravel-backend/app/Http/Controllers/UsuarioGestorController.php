<?php

namespace App\Http\Controllers;

use App\Models\Usuario;
use App\Models\VHistorialPrestamos;
use App\Traits\ApiResponse;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Hash;
use Illuminate\Support\Facades\Validator;
use Illuminate\Support\Facades\log;

class UsuarioGestorController extends Controller
{
    use ApiResponse;

    /**
     * GET /gestion/usuario
     * Listar usuario con paginación y filtros
     */
    public function index(Request $request)
    {
        $perPage = min($request->get('per_page', 10), 100); 
        $page = $request->get('page', 1);

        $query = Usuario::with(['rol', 'estado', 'correos', 'telefonos']);

        // Filtros opcionales
        if ($request->filled('documento')) {
            $query->where('documento', 'like', '%' . $request->documento . '%');
        }

        if ($request->filled('busqueda')) {
            $busqueda = $request->busqueda;
            $query->where(function ($q) use ($busqueda) {
                $q->where('documento', 'like', "%$busqueda%")
                  ->orWhere('nombre', 'like', "%$busqueda%")
                  ->orWhere('apellido', 'like', "%$busqueda%");
            });
        }

        if ($request->filled('rol')) {
            $query->where('cod_rol', $request->rol);
        }

        if ($request->filled('estado')) {
            $query->where('cod_estado_usuario', $request->estado);
        }

        $usuario = $query->paginate($perPage, ['*'], 'page', $page);

        return $this->paginatedResponse($usuario, 'usuario obtenidos correctamente');
    }

    /**
     * POST /gestion/usuario
     * Crear nuevo usuario
     */
public function store(Request $request)
    {
        $validator = Validator::make($request->all(), [
            'documento' => 'required|unique:usuario,documento',
            'nombre' => 'required|string|regex:/^[a-z \s]+$/i',
            'apellido' => 'required|string|regex:/^[a-z \s]+$/i',
            'correo' => 'required|email|unique:correo,correo',
            'telefono' => 'required|string|min:7|max:15|unique:telefono,telefono',
            'cod_rol' => 'required|exists:rol,cod_rol'
        ]);

        if ($validator->fails()) {
            return $this->errorResponse('Validación fallida', 422, $validator->errors());
        }

        try {
            $usuario = Usuario::create([
                'documento' => $request->documento,
                'nombre' => $request->nombre,
                'apellido' => $request->apellido,
                'password' => Hash::make('1234567890'),
                'cod_rol' => $request->cod_rol,
                'cod_estado_usuario' => 2 
            ]);

            if ($request->filled('correo')) {
                $usuario->correos()->create(['correo' => $request->correo]);
            }

            if ($request->filled('telefono')) {
                $usuario->telefonos()->create(['telefono' => $request->telefono]);
            }

            return $this->successResponse($usuario->load(['rol', 'estado']), 'Usuario creado correctamente', 201);
            
            } catch (\Exception $e) {
                Log::error('Error al crear usuario: ' . $e->getMessage());

                return $this->errorResponse('Error interno del servidor al procesar la solicitud.', 500);
            }
    }

    /**
     * DELETE /gestion/usuario/{documento}
     * Eliminar usuario
     */
    public function destroy($documento)
    {
        $usuario = Usuario::where('documento', $documento)->first();

        if (!$usuario) {
            return $this->notFoundResponse('Usuario');
        }

        try {
            // Soft delete (si existe)
            if (method_exists($usuario, 'delete')) {
                $usuario->delete();
            }

            return response()->json([
                'success' => true,
                'mensaje' => 'Usuario eliminado correctamente'
            ], 200);
        } catch (\Exception $e) {
            return $this->errorResponse(
                'Error al eliminar usuario: ' . $e->getMessage(),
                500
            );
        }
    }

    /**
     * GET /gestion/usuario/estados/list
     * Listar todos los estados disponibles
     */
    public function listarEstados()
    {
        $estados = \App\Models\EstadoUsuario::all();

        return $this->successResponse(
            $estados,
            'Estados obtenidos correctamente'
        );
    }

    /**
     * GET /gestion/usuario/rol/list
     * Listar todos los rol disponibles
     */
    public function listarrol()
    {
        $rol = \App\Models\Rol::all();

        return $this->successResponse(
            $rol,
            'rol obtenidos correctamente'
        );
    }

    /**
     * GET /gestion/usuario/prestamos-activos
     * Obtener préstamos activos con paginación
     */
    public function obtenerPrestamosActivos(Request $request)
    {
        $perPage = min($request->get('per_page', 10), 100);
        $page = $request->get('page', 1);
        $query = VHistorialPrestamos::where('cod_estado_prestamo', '<>', 3); 

        // Filtros
        if ($request->filled('busqueda')) {
            $busqueda = $request->busqueda;
            $query->where(function ($q) use ($busqueda) {
                $q->where('documento', 'like', "%$busqueda%")
                  ->orWhere('nombre', 'like', "%$busqueda%")
                  ->orWhere('elemento', 'like', "%$busqueda%");
            });
        }

        if ($request->filled('estado')) {
            $query->where('cod_estado_prestamo', $request->estado);
        }

        if ($request->filled('tipo')) {
            $query->where('cod_tipo_elemento', $request->tipo);
        }

        $prestamos = $query->paginate($perPage, ['*'], 'page', $page);

        return $this->paginatedResponse($prestamos, 'Préstamos obtenidos correctamente');
    }

    /**
     * PUT /gestion/usuario/prestamos-activos/{id}
     * Actualizar estado de un préstamo
     */
    public function actualizarEstadoPrestamo(Request $request, $id)
    {
        $validator = Validator::make($request->all(), [
            'cod_estado_prestamo' => 'required|integer|between:1,5',
            'observaciones' => 'nullable|string|max:500'
        ]);

        if ($validator->fails()) {
            return $this->errorResponse(
                'Validación fallida',
                422,
                $validator->errors()
            );
        }

        try {
            $prestamo = \App\Models\Prestamo::findOrFail($id);

            $prestamo->update([
                'cod_estado_prestamo' => $request->cod_estado_prestamo,
                'observaciones' => $request->observaciones
            ]);

            return $this->successResponse(
                $prestamo,
                'Estado de préstamo actualizado correctamente'
            );
        } catch (\Illuminate\Database\Eloquent\ModelNotFoundException $e) {
            return $this->notFoundResponse('Préstamo');
        } catch (\Exception $e) {
            return $this->errorResponse(
                'Error al actualizar préstamo: ' . $e->getMessage(),
                500
            );
        }
    }

    /**
     GET /gestion/usuario/prestamos-activos/exportar
     Exportar préstamos a Excel o PDF
    
    public function exportarPrestamos(Request $request)
    {
        $formato = $request->get('formato', 'excel');

        try {
            $prestamos = VHistorialPrestamos::where('cod_estado_prestamo', '<>', 3)->get();

            if ($formato === 'pdf') {
                // Implementar exportación a PDF si es necesario
                return $this->errorResponse(
                    'Exportación PDF aún no implementada',
                    501
                );
            }

            // Excel por defecto
            return \Maatwebsite\Excel\Facades\Excel::download(
                new \App\Exports\PrestamosExport($prestamos),
                'prestamos_activos_' . now()->format('Y-m-d') . '.xlsx'
            );
        } catch (\Exception $e) {
            return $this->errorResponse(
                'Error al exportar: ' . $e->getMessage(),
                500
            );
        }
    }**/
}