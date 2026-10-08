<?php

namespace Database\Seeders;

use Illuminate\Database\Seeder;
use Illuminate\Support\Facades\DB;

class RolSeeder extends Seeder
{
    public function run(): void
    {
        $roles = [
            1 => 'Docente',
            2 => 'Tecnico',
            3 => 'Gerente',
        ];

        foreach ($roles as $codigo => $cargo) {
            DB::table('rol')->updateOrInsert(
                ['cod_rol' => $codigo],
                ['cargo' => $cargo]
            );
        }
    }
}