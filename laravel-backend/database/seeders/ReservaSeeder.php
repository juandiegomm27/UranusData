<?php
namespace Database\Seeders;
use Illuminate\Database\Seeder;
use Illuminate\Support\Facades\DB;

class ReservaSeeder extends Seeder
{
    public function run(): void
    {
        // 1. Crear las Reservas Base (Sin elemento ni cantidad)
        DB::table('Reserva')->insertOrIgnore([
            ['id_Reserva' => 1, 
            'Num_estado' => 2, 
            'documento' => '1234567890', 
            'fecha' => now()->subDays(3)->toDateString(), 
            'plazo' => now()->addDays(2)->toDateString()
            ],

            ['id_Reserva' => 2, 
            'Num_estado' => 1, 
            'documento' => '1000000001', 
            'fecha' => now()->subDay()->toDateString(), 
            'plazo' => now()->addDays(3)->toDateString()
            ],

            ['id_Reserva' => 3, 
            'Num_estado' => 3, 
            'documento' => '1000000002', 
            'fecha' => now()->subDays(5)->toDateString(), 
            'plazo' => now()->subDay()->toDateString()
            ],
        ]);

        // 2. Llenar los detalles vinculando al ID del inventario correspondiente
        DB::table('reserva_detalles')->insertOrIgnore([
            ['id_Reserva' => 1, 
            'id_elemento' => 1, 
            'cantidad_solicitada' => 1, 
            'cantidad_entregada' => 1
            ],
            
            ['id_Reserva' => 2, 
            'id_elemento' => 4, 
            'cantidad_solicitada' => 1, 
            'cantidad_entregada' => 0
            ],

            ['id_Reserva' => 3, 
            'id_elemento' => 6, 
            'cantidad_solicitada' => 1, 
            'cantidad_entregada' => 0
            ],
        ]);
    }
}