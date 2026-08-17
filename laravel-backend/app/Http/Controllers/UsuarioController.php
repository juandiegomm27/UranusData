<?php

namespace App\Http\Controllers;

use App\Models\Usuario;
use App\Models\Correo;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Hash;

class UsuarioController extends Controller
{
    public function index()
    {
        return response()->json(Usuario::with('rol', 'correos', 'telefonos')->get());
    }

    public function show($documento)
    {
        $usuario = Usuario::with('rol', 'correos', 'telefonos')->find($documento);
        if (!$usuario) {
            return response()->json(['status' => 'error', 'mensaje' => 'Usuario no encontrado'], 404);
        }
        return response()->json($usuario);
    }

    public function store(Request $request)
    {
        $validated = $request->validate([
            'documento' => 'required|unique:usuario',
            'nombre' => 'required',
            'apellido' => 'required',
            'cod_rol' => 'required|exists:rol,cod_rol',
            'correo' => 'required|email|unique:correo',
            'password' => 'required|min:6'
        ]);

        $usuario = Usuario::create([
            'documento' => $validated['documento'],
            'nombre' => $validated['nombre'],
            'apellido' => $validated['apellido'],
            'cod_rol' => $validated['cod_rol']
        ]);

        Correo::create([
            'correo' => $validated['correo'],
            'documento' => $usuario->documento
        ]);

        return response()->json(['status' => 'success', 'usuario' => $usuario], 201);
    }

    public function update(Request $request, $documento)
    {
        $usuario = Usuario::find($documento);
        if (!$usuario) {
            return response()->json(['status' => 'error', 'mensaje' => 'Usuario no encontrado'], 404);
        }

        $usuario->update($request->only(['nombre', 'apellido', 'cod_rol']));
        return response()->json(['status' => 'success', 'usuario' => $usuario]);
    }

    public function destroy($documento)
    {
        $usuario = Usuario::find($documento);
        if (!$usuario) {
            return response()->json(['status' => 'error', 'mensaje' => 'Usuario no encontrado'], 404);
        }

        $usuario->delete();
        return response()->json(['status' => 'success', 'mensaje' => 'Usuario eliminado']);
    }
}