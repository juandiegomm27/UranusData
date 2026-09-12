<?php

namespace Database\Seeders;

use Illuminate\Database\Seeder;
use Illuminate\Support\Facades\DB;

class ReservaSeeder extends Seeder
{
    public function run(): void
    {
        DB::table('Reserva')->insertOrIgnore([
            [
                'id_Reserva' => 1,
                'Num_estado' => 2,
                'documento' => '1234567890',
                'fecha' => now()->subDays(3)->toDateString(),
                'plazo' => now()->addDays(2)->toDateString(),
                'cantidad' => 1,
                'elemento' => 'COMP-001',
            ],
            [
                'id_Reserva' => 2,
                'Num_estado' => 1,
                'documento' => '1000000001',
                'fecha' => now()->subDay()->toDateString(),
                'plazo' => now()->addDays(3)->toDateString(),
                'cantidad' => 1,
                'elemento' => 'PROY-001',
            ],
            [
                'id_Reserva' => 3,
                'Num_estado' => 3,
                'documento' => '1000000002',
                'fecha' => now()->subDays(5)->toDateString(),
                'plazo' => now()->subDay()->toDateString(),
                'cantidad' => 1,
                'elemento' => 'PORT-001',
            ],
        ]);
    }
}