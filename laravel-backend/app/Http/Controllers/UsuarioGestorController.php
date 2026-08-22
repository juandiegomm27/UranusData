<?php

namespace App\Http\Controllers;

use App\Models\Usuario;
use App\Models\Correo;
use App\Models\Telefono;
use App\Models\EstadoUsuario;
use App\Models\Rol;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Hash;
use Illuminate\Support\Facades\DB;
use App\Models\VUsuariosCompletos;

class UsuarioGestorController extends Controller
{
    public function index(Request $request){
        $perPage = $request->get('per_page', 10);
        $rol = $request->get('rol');
        $estado = $request->get('estado');
        $documento = $request->get('documento');

        $query = VUsuariosCompletos::query();

        if ($rol) {
            $query->where('cod_rol', $rol);
        }

        if ($estado) {
            $query->where('cod_estado_usuario', $estado);
        }

        if ($documento) {
            $query->where('documento', 'like', "%$documento%");
        }

        $usuarios = $query->paginate($perPage);

        return response()->json([
            'status' => 'success',
            'data' => $usuarios->items(),
            'total' => $usuarios->total(),
            'per_page' => $usuarios->perPage(),
            'current_page' => $usuarios->currentPage(),
            'last_page' => $usuarios->lastPage()
        ]);
    }

    public function show($documento){
        $usuario = VUsuariosCompletos::find($documento);

        if (!$usuario) {
            return response()->json(['status' => 'error', 'mensaje' => 'Usuario no encontrado'], 404);
        }

        return response()->json([
            'status' => 'success',
            'usuario' => [
                'documento' => $usuario->documento,
                'nombre' => $usuario->nombre,
                'apellido' => $usuario->apellido,
                'cod_rol' => $usuario->cod_rol,
                'rol' => $usuario->rol,
                'correo' => $usuario->correo,
                'telefono' => $usuario->telefono,
                'estado' => $usuario->estado_usuario,
                'cod_estado_usuario' => $usuario->cod_estado_usuario
            ]
        ]);
    }

    public function store(Request $request)
    {
        $validated = $request->validate([
            'nombre' => 'required|string',
            'apellido' => 'required|string',
            'documento' => 'required|unique:usuario',
            'correo' => 'required|email|unique:correo',
            'telefono' => 'nullable|string|max:15',
            'cod_rol' => 'required|exists:rol,cod_rol',
            'password' => 'required|min:6'
        ]);

        $usuario = Usuario::create([
            'documento' => $validated['documento'],
            'nombre' => $validated['nombre'],
            'apellido' => $validated['apellido'],
            'cod_rol' => $validated['cod_rol'],
            'cod_estado_usuario' => 2,
            'password' => Hash::make($validated['password'])
        ]);

        Correo::create([
            'correo' => $validated['correo'],
            'documento' => $usuario->documento
        ]);

        if ($validated['telefono'] ?? null) {
            Telefono::create([
                'telefono' => $validated['telefono'],
                'documento' => $usuario->documento
            ]);
        }

        return response()->json(['status' => 'success', 'mensaje' => 'Usuario creado exitosamente', 'usuario' => $usuario], 201);
    }

    public function update(Request $request, $documento)
    {
        $usuario = Usuario::find($documento);

        if (!$usuario) {
            return response()->json(['status' => 'error', 'mensaje' => 'Usuario no encontrado'], 404);
        }

        $validated = $request->validate([
            'nombre' => 'string',
            'apellido' => 'string',
            'correo' => 'email|unique:correo,correo',
            'telefono' => 'nullable|string|max:15',
            'cod_rol' => 'exists:rol,cod_rol',
            'cod_estado_usuario' => 'exists:estado_usuario,cod_estado_usuario'
        ]);

        $usuario->update($request->only(['nombre', 'apellido', 'cod_rol', 'cod_estado_usuario']));

        if ($validated['correo'] ?? null) {
            Correo::where('documento', $documento)->update(['correo' => $validated['correo']]);
        }

        if ($validated['telefono'] ?? null) {
            $tel = Telefono::where('documento', $documento)->first();
            if ($tel) {
                $tel->update(['telefono' => $validated['telefono']]);
            } else {
                Telefono::create(['telefono' => $validated['telefono'], 'documento' => $documento]);
            }
        }

        return response()->json(['status' => 'success', 'mensaje' => 'Usuario actualizado']);
    }

    public function destroy($documento)
{
    $usuario = Usuario::find($documento);

    if (!$usuario) {
        return response()->json([
            'status' => 'error',
            'mensaje' => 'Usuario no encontrado'
        ], 404);
    }

    try {
        // Eliminar registros relacionados primero
        DB::table('correo')->where('documento', $documento)->delete();
        DB::table('telefono')->where('documento', $documento)->delete();
        DB::table('password_reset_tokens')->where('documento', $documento)->delete();

        // Luego eliminar el usuario
        $usuario->delete();

        return response()->json([
            'status' => 'success',
            'mensaje' => 'Usuario eliminado exitosamente'
        ]);
    } catch (\Exception $e) {
        return response()->json([
            'status' => 'error',
            'mensaje' => 'Error al eliminar usuario: ' . $e->getMessage()
        ], 500);
    }
}

    public function estados()
    {
        $estados = EstadoUsuario::all();
        return response()->json(['status' => 'success', 'data' => $estados]);
    }

    public function roles()
    {
        $roles = Rol::all();
        return response()->json(['status' => 'success', 'data' => $roles]);
    }
}