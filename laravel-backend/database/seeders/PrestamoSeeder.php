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
                'fecha_entrega_original' => now()->addDays(5)->toDateString(),
                'fecha_limite_actual' => now()->addDays(5)->toDateString(),
                'extension_aprobada' => false
            ],
            [
                'id_Reserva' => 2,
                'cod_estado_prestamo' => 1,
                'fecha_inicio' => now()->toDateString(),
                'fecha_entrega_original' => now()->addDays(1)->toDateString(),
                'fecha_limite_actual' => now()->addDays(1)->toDateString(),
                'extension_aprobada' => false
            ],
            [
                'id_Reserva' => 3,
                'cod_estado_prestamo' => 3,
                'fecha_inicio' => now()->subDays(10)->toDateString(),
                'fecha_entrega_original' => now()->subDays(3)->toDateString(),
                'fecha_limite_actual' => now()->subDays(3)->toDateString(),
                'extension_aprobada' => false
            ],
        ]);
    }
}