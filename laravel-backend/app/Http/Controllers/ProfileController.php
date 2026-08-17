<?php

namespace App\Http\Controllers;

use App\Models\Usuario;
use App\Models\Correo;
use App\Models\Telefono;
use App\Mail\ProfileUpdateMail;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Mail;
use Illuminate\Support\Facades\Hash;
use Illuminate\Support\Facades\DB;  // ← Agregar esta línea

class ProfileController extends Controller
{
    public function getProfile($documento)
{
    $usuario = Usuario::find($documento);

    if (!$usuario) {
        return response()->json(['status' => 'error', 'mensaje' => 'Usuario no encontrado'], 404);
    }

    // Usar raw query en lugar de Eloquent
    $correo = DB::table('correo')->where('documento', $documento)->value('correo');
    $telefono = DB::table('telefono')->where('documento', $documento)->value('telefono');

    return response()->json([
        'status' => 'success',
        'usuario' => [
            'documento' => $usuario->documento,
            'nombre' => $usuario->nombre,
            'apellido' => $usuario->apellido,
            'rol' => $usuario->rol->cargo,
            'correo' => $correo ?? '',
            'telefono' => $telefono ?? ''
        ]
    ]);
}

    public function updateProfile(Request $request, $documento)
    {
        $usuario = Usuario::find($documento);

        if (!$usuario) {
            return response()->json(['status' => 'error', 'mensaje' => 'Usuario no encontrado'], 404);
        }

        $validated = $request->validate([
            'nombre' => 'required|string',
            'apellido' => 'required|string',
            'correo' => 'email|unique:correo,correo',
            'telefono' => 'nullable|string|max:15',
            'password' => 'nullable|min:6'
        ]);

        $usuario->update([
            'nombre' => $validated['nombre'],
            'apellido' => $validated['apellido']
        ]);

        if ($validated['password'] ?? null) {
            $usuario->password = Hash::make($validated['password']);
            $usuario->save();
        }

        if (!empty($validated['correo'])) {
            $correoExistente = Correo::where('documento', $documento)->first();
            if ($correoExistente) {
                $correoExistente->update(['correo' => $validated['correo']]);
            } else {
                Correo::create([
                    'correo' => $validated['correo'],
                    'documento' => $documento
                ]);
            }
        }

        if (!empty($validated['telefono'])) {
            $telefonoExistente = Telefono::where('documento', $documento)->first();
            if ($telefonoExistente) {
                $telefonoExistente->update(['telefono' => $validated['telefono']]);
            } else {
                Telefono::create([
                    'telefono' => $validated['telefono'],
                    'documento' => $documento
                ]);
            }
        }

        $usuarioActualizado = Usuario::with('rol', 'correos', 'telefonos')->find($documento);
        $correoUsuario = $usuarioActualizado->correos->first()?->correo;

        if ($correoUsuario) {
            Mail::to($correoUsuario)->send(new ProfileUpdateMail(
                $usuarioActualizado->nombre,
                $usuarioActualizado->apellido,
                $correoUsuario,
                $usuarioActualizado->telefonos->first()?->telefono,
                $usuarioActualizado->rol->cargo
            ));
        }

        return response()->json([
            'status' => 'success',
            'mensaje' => 'Perfil actualizado correctamente',
            'usuario' => [
                'documento' => $usuarioActualizado->documento,
                'nombre' => $usuarioActualizado->nombre,
                'apellido' => $usuarioActualizado->apellido,
                'rol' => $usuarioActualizado->rol->cargo,
                'correo' => $correoUsuario,
                'telefono' => $usuarioActualizado->telefonos->first()?->telefono,
            ]
        ]);
    }
}