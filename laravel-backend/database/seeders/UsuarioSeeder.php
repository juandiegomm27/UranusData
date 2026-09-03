<?php

namespace Database\Seeders;

use Illuminate\Database\Seeder;
use Illuminate\Support\Facades\DB;

class UsuarioSeeder extends Seeder
{
    public function run(): void
    {
        \App\Models\EstadoUsuario::firstOrCreate(
            ['cod_estado_usuario' => 1],
            ['estado' => 'Activo']
        );
        \App\Models\EstadoUsuario::firstOrCreate(
            ['cod_estado_usuario' => 2],
            ['estado' => 'Inactivo']
        );

        $docente = \App\Models\Rol::where('cargo', 'Docente')->first();
        $tecnico = \App\Models\Rol::where('cargo', 'Tecnico')->first();
        $gerente = \App\Models\Rol::where('cargo', 'Gerente')->first();

        $usuario1 = \App\Models\Usuario::create([
            'documento' => 1234567890,
            'nombre' => 'Juan Diego',
            'apellido' => 'Medina Mahecha',
            'cod_rol' => $docente->cod_rol,
            'password' => \Illuminate\Support\Facades\Hash::make('1234567890')
        ]);

        \App\Models\Correo::create([
            'correo' => '1234567890@gmail.com',
            'documento' => $usuario1->documento
        ]);

        $usuario2 = \App\Models\Usuario::create([
            'documento' => 1234567891,
            'nombre' => 'Juan Diego',
            'apellido' => 'Medina Mahecha',
            'cod_rol' => $tecnico->cod_rol,
            'password' => \Illuminate\Support\Facades\Hash::make('1234567890')
        ]);

        \App\Models\Correo::create([
            'correo' => '1234567891@gmail.com',
            'documento' => $usuario2->documento
        ]);

        $usuario3 = \App\Models\Usuario::create([
            'documento' => 1234567892,
            'nombre' => 'Juan Diego',
            'apellido' => 'Medina Mahecha',
            'cod_rol' => $gerente->cod_rol,
            'password' => \Illuminate\Support\Facades\Hash::make('1234567890')
        ]);

        \App\Models\Correo::create([
            'correo' => '1234567892@gmail.com',
            'documento' => $usuario3->documento
        ]);

        DB::statement('CALL sp_generar_usuarios()');
    }
}
