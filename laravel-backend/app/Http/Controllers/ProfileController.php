<?php

namespace App\Http\Controllers;

use App\Models\Usuario;
use App\Traits\ApiResponse;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Validator;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Log;
use Illuminate\Support\Facades\Schema;

class ProfileController extends Controller
{
    use ApiResponse;

    //GET /perfil/{documento}
    public function obtenerPerfil($documento)
    {
        $usuario = Usuario::with(['rol', 'estado', 'correos', 'telefonos'])
            ->where('documento', $documento)
            ->first();

        if (!$usuario) {
            return $this->notFoundResponse('Usuario');
        }

        return $this->successResponse(
            $usuario,
            'Perfil obtenido correctamente'
        );
    }

///PUT /perfil/{documento}
    public function actualizarPerfil(Request $request, $documento)
    {
        $usuario = Usuario::where('documento', $documento)->first();
        if (!$usuario) {
            return $this->notFoundResponse('Usuario');
        }

        $rolUsuario = $request->user()->rol?->cargo;
        if ($request->user()->documento !== $documento && $rolUsuario !== 'Gerente') { 
            return $this->forbiddenResponse('No puedes editar el perfil de otro usuario');
        }

        $validator = Validator::make($request->all(), [
            'documento' => 'sometimes|string|digits:10|unique:usuario,documento,' . $usuario->documento . ',documento',
            'nombre' => 'sometimes|string|regex:/^[a-zA-Z áéíóúÁÉÍÓÚñÑ\s]+$/u',
            'apellido' => 'sometimes|string|regex:/^[a-zA-Z áéíóúÁÉÍÓÚñÑ\s]+$/u',
            'correo' => 'sometimes|email',
            'telefono' => 'sometimes|string|regex:/^\d{10,15}$/',
            'password' => 'nullable|string|min:6'
        ]);

        if ($validator->fails()) {
            return $this->errorResponse('Validación fallida', 422, $validator->errors());
        }

        try {
            \Illuminate\Support\Facades\DB::transaction(function () use ($request, $usuario) {
                
                if ($request->filled('documento') && $request->documento !== $usuario->documento) {
                    $nuevoDoc = $request->documento;
                    $viejoDoc = $usuario->documento;

                    Schema::disableForeignKeyConstraints();

                    DB::table('correo')->where('documento', $viejoDoc)->update(['documento' => $nuevoDoc]);
                    DB::table('telefono')->where('documento', $viejoDoc)->update(['documento' => $nuevoDoc]);
                    DB::table('mantenimiento')->where('documento', $viejoDoc)->update(['documento' => $nuevoDoc]);
                    DB::table('reserva')->where('documento', $viejoDoc)->update(['documento' => $nuevoDoc]);
                    DB::table('password_reset_tokens')->where('documento', $viejoDoc)->update(['documento' => $nuevoDoc]);

                    $usuario->documento = $nuevoDoc;
                    
                    Schema::enableForeignKeyConstraints();
                }

                if ($request->filled('nombre')) {
                    $usuario->nombre = $request->nombre;
                }
                if ($request->filled('apellido')) {
                    $usuario->apellido = $request->apellido;
                }
                if ($request->filled('password')) {
                    $usuario->password = bcrypt($request->password);
                }
                
                $usuario->save();

                if ($request->filled('correo')) {
                    $usuario->correos()->updateOrCreate(
                        ['documento' => $usuario->documento],
                        ['correo' => $request->correo]
                    );
                }

                if ($request->filled('telefono')) {
                    $usuario->telefonos()->updateOrCreate(
                        ['documento' => $usuario->documento],
                        ['telefono' => $request->telefono]
                    );
                }
            });

            return $this->successResponse(
                $usuario->load(['correos', 'telefonos']),
                'Perfil actualizado correctamente'
            );
        } catch (\Exception $e) {
            Schema::enableForeignKeyConstraints();
            Log::error('Error al actualizar perfil: ' . $e->getMessage());
            return $this->errorResponse('Error interno al actualizar el perfil', 500);
        }
    }
}