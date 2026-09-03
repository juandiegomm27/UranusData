<?php

namespace Database\Seeders;

use Illuminate\Database\Seeder;
use Illuminate\Support\Facades\DB;

class EstadoUsuarioSeeder extends Seeder
{
    public function run(): void
    {
        $estados = [
            ['cod_estado_usuario' => 1, 'estado' => 'Activo'],
            ['cod_estado_usuario' => 2, 'estado' => 'Inactivo'],
            ['cod_estado_usuario' => 3, 'estado' => 'Bloqueado'],
        ];

        foreach ($estados as $estado) {
            DB::table('estado_usuarios')->updateOrInsert(
                ['cod_estado_usuario' => $estado['cod_estado_usuario']],
                $estado
            );
        }
    }
}