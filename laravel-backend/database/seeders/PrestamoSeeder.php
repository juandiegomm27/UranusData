<?php

namespace Database\Seeders;

use Illuminate\Database\Seeder;
use Illuminate\Support\Facades\DB;

class PrestamoSeeder extends Seeder
{
    public function run(): void
    {
        DB::table('prestamo')->insertOrIgnore([
            [
                'id_Reserva' => 1,
                'cod_estado_prestamo' => 2,
                'fecha_inicio' => now()->subDays(2)->toDateString(),
                'fecha_entrega' => now()->addDays(5)->toDateString(),
                'cantidad' => 1,
            ],
            [
                'id_Reserva' => 2,
                'cod_estado_prestamo' => 1,
                'fecha_inicio' => now()->toDateString(),
                'fecha_entrega' => now()->addDays(1)->toDateString(),
                'cantidad' => 1,
            ],
            [
                'id_Reserva' => 3,
                'cod_estado_prestamo' => 3,
                'fecha_inicio' => now()->subDays(10)->toDateString(),
                'fecha_entrega' => now()->subDays(3)->toDateString(),
                'cantidad' => 1,
            ],
        ]);
    }
}