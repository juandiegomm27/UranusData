<?php

namespace Database\Seeders;

use Illuminate\Database\Seeder;
use Illuminate\Support\Facades\DB;

class InventarioSeeder extends Seeder
{
    public function run(): void
    {

        DB::table('inventario')->insertOrIgnore([
            [
                'cod_elemento' => 'COMP-001', 
                'nombre_elemento' => 'Torre Dell OptiPlex 3080', 
                'serial' => 'DL-111', 
                'modelo' => 'OptiPlex 3080', 
                'descripcion' => 'Equipo en uso en la Sala 1 para presentaciones y clases',
                'cod_tipo_elemento' => 1, 
                'cod_estado_elemento' => 1, 
                'cod_ubi_elemento' => 1
            ],

            [
                'cod_elemento' => 'COMP-002', 
                'nombre_elemento' => 'Torre Dell OptiPlex 3080', 
                'serial' => 'DL-222', 
                'modelo' => 'OptiPlex 3080', 
                'descripcion' => 'Equipo en uso continuo por docentes en Sala 3',
                'cod_tipo_elemento' => 1, 
                'cod_estado_elemento' => 1, 
                'cod_ubi_elemento' => 1
            ],

            [
                'cod_elemento' => 'MON-001', 
                'nombre_elemento' => 'Monitor LG 22 Pulgadas', 
                'serial' => 'LG-123', 
                'modelo' => '22MK400H',
                'descripcion' => 'Equipo en uso en la Sala 1 para presentaciones y clases', 
                'cod_tipo_elemento' => 2, 
                'cod_estado_elemento' => 1, 
                'cod_ubi_elemento' => 1
            ],

            [
                'cod_elemento' => 'PROY-001', 
                'nombre_elemento' => 'Proyector Epson PowerLite', 
                'serial' => 'EP-001', 
                'modelo' => 'PowerLite X39', 
                'descripcion' => 'Equipo en uso en la Sala 1 para presentaciones y clases',
                'cod_tipo_elemento' => 3, 
                'cod_estado_elemento' => 1, 
                'cod_ubi_elemento' => 3
            ],

            [
                'cod_elemento' => 'COMP-003',
                'nombre_elemento' => 'Torre HP ProDesk 400',
                'serial' => 'HP-5542',
                'modelo' => 'ProDesk G6',
                'descripcion' => 'Equipo en uso continuo por docentes en Sala 3',
                'cod_tipo_elemento' => 1,
                'cod_estado_elemento' => 1,
                'cod_ubi_elemento' => 2
            ],
            [
                'cod_elemento' => 'PORT-001',
                'nombre_elemento' => 'Laptop Lenovo ThinkPad',
                'serial' => 'LNV-8821',
                'modelo' => 'E14 Gen 2',
                'descripcion' => 'Asignada a coordinación académica',
                'cod_tipo_elemento' => 1,
                'cod_estado_elemento' => 1,
                'cod_ubi_elemento' => 3
            ],
            [
                'cod_elemento' => 'MON-002',
                'nombre_elemento' => 'Monitor Dell 24 Pulgadas',
                'serial' => 'DL-7731',
                'modelo' => 'P2422H',
                'descripcion' => 'Pantalla principal en Sala 2',
                'cod_tipo_elemento' => 2,
                'cod_estado_elemento' => 1,
                'cod_ubi_elemento' => 2
            ],
            [
                'cod_elemento' => 'PROY-002',
                'nombre_elemento' => 'Proyector Sony VPL',
                'serial' => 'SN-4021',
                'modelo' => 'VPL-EX435',
                'descripcion' => 'Operativo en Sala 1 para clases magistrales',
                'cod_tipo_elemento' => 3,
                'cod_estado_elemento' => 1,
                'cod_ubi_elemento' => 1
            ],
            [
                'cod_elemento' => 'IMP-001',
                'nombre_elemento' => 'Impresora Multifuncional Brother',
                'serial' => 'BR-3392',
                'modelo' => 'DCP-L5650DN',
                'descripcion' => 'Impresora de red en Almacén Central',
                'cod_tipo_elemento' => 5,
                'cod_estado_elemento' => 1,
                'cod_ubi_elemento' => 3
            ]
        ]);
    }
}