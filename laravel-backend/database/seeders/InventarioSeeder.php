<?php

namespace Database\Seeders;

use App\Models\Inventario;
use App\Models\InventarioAccesorio;
use App\Models\Marca;
use App\Models\StockAccesorio;
use Illuminate\Database\Seeder;

class InventarioSeeder extends Seeder
{
    public function run(): void
    {
        $elementos = [
            [
                'cod_elemento' => 'COMP-001',
                'nombre_elemento' => 'Torre Dell OptiPlex 3080',
                'marca' => 'Dell',
                'serial' => 'DL-111',
                'modelo' => 'OptiPlex 3080',
                'descripcion' => 'Equipo en uso en la Sala 1 para presentaciones y clases',
                'cod_tipo_elemento' => 1,
                'cod_ubi_elemento' => 1,
            ],
            [
                'cod_elemento' => 'COMP-002',
                'nombre_elemento' => 'Torre Dell OptiPlex 3080',
                'marca' => 'Dell',
                'serial' => 'DL-222',
                'modelo' => 'OptiPlex 3080',
                'descripcion' => 'Equipo en uso continuo por docentes en Sala 3',
                'cod_tipo_elemento' => 1,
                'cod_ubi_elemento' => 1,
            ],
            [
                'cod_elemento' => 'MON-001',
                'nombre_elemento' => 'Monitor LG 22 Pulgadas',
                'marca' => 'LG',
                'serial' => 'LG-123',
                'modelo' => '22MK400H',
                'descripcion' => 'Equipo en uso en la Sala 1 para presentaciones y clases',
                'cod_tipo_elemento' => 2,
                'cod_ubi_elemento' => 1,
            ],
            [
                'cod_elemento' => 'PROY-001',
                'nombre_elemento' => 'Proyector Epson PowerLite',
                'marca' => 'Epson',
                'serial' => 'EP-001',
                'modelo' => 'PowerLite X39',
                'descripcion' => 'Equipo en uso en la Sala 1 para presentaciones y clases',
                'cod_tipo_elemento' => 3,
                'cod_ubi_elemento' => 3,
            ],
            [
                'cod_elemento' => 'COMP-003',
                'nombre_elemento' => 'Torre HP ProDesk 400',
                'marca' => 'HP',
                'serial' => 'HP-5542',
                'modelo' => 'ProDesk G6',
                'descripcion' => 'Equipo en uso continuo por docentes en Sala 3',
                'cod_tipo_elemento' => 1,
                'cod_ubi_elemento' => 2,
            ],
            [
                'cod_elemento' => 'PORT-001',
                'nombre_elemento' => 'Laptop Lenovo ThinkPad',
                'marca' => 'Lenovo',
                'serial' => 'LNV-8821',
                'modelo' => 'E14 Gen 2',
                'descripcion' => 'Asignada a coordinación académica',
                'cod_tipo_elemento' => 1,
                'cod_ubi_elemento' => 3,
            ],
            [
                'cod_elemento' => 'MON-002',
                'nombre_elemento' => 'Monitor Dell 24 Pulgadas',
                'marca' => 'Dell',
                'serial' => 'DL-7731',
                'modelo' => 'P2422H',
                'descripcion' => 'Pantalla principal en Sala 2',
                'cod_tipo_elemento' => 2,
                'cod_ubi_elemento' => 2,
            ],
            [
                'cod_elemento' => 'PROY-002',
                'nombre_elemento' => 'Proyector Sony VPL',
                'marca' => 'Sony',
                'serial' => 'SN-4021',
                'modelo' => 'VPL-EX435',
                'descripcion' => 'Operativo en Sala 1 para clases magistrales',
                'cod_tipo_elemento' => 3,
                'cod_ubi_elemento' => 1,
            ],
            [
                'cod_elemento' => 'IMP-001',
                'nombre_elemento' => 'Impresora Multifuncional Brother',
                'marca' => 'Brother',
                'serial' => 'BR-3392',
                'modelo' => 'DCP-L5650DN',
                'descripcion' => 'Impresora de red en Almacén Central',
                'cod_tipo_elemento' => 5,
                'cod_ubi_elemento' => 3,
            ],
        ];

        foreach ($elementos as $datos) {
            $this->guardarElemento($datos);
        }

        // Componentes con serial: el cargador y el mouse pertenecen al portátil
        $portatil = Inventario::where('cod_elemento', 'PORT-001')->first();

        $componentes = [
            [
                'cod_elemento' => 'CARG-001',
                'nombre_elemento' => 'Cargador Lenovo 65W',
                'marca' => 'Lenovo',
                'serial' => 'LNV-CH-001',
                'modelo' => 'ADLX65',
                'descripcion' => 'Cargador original del portátil de coordinación académica',
                'cod_tipo_elemento' => 4,
                'cod_ubi_elemento' => 3,
            ],
            [
                'cod_elemento' => 'MOU-001',
                'nombre_elemento' => 'Mouse inalámbrico Logitech',
                'marca' => 'Logitech',
                'serial' => 'LG-MS-001',
                'modelo' => 'M185',
                'descripcion' => 'Mouse asignado al portátil de coordinación académica',
                'cod_tipo_elemento' => 4,
                'cod_ubi_elemento' => 3,
            ],
        ];

        foreach ($componentes as $datos) {
            $this->guardarElemento($datos + ['id_elemento_padre' => $portatil->id_elemento]);
        }

        // Repuestos y consumibles por cantidad (sin serial), repartidos por ubicación
        $accesorios = [
            [
                'nombre' => 'Gancho metálico',
                'marca' => 'Genérica',
                'modelo' => null,
                'descripcion' => 'Ganchos para sujetar cableado y soportes',
                'cod_tipo_elemento' => 4,
                'stocks' => [1 => 20, 3 => 30],
            ],
            [
                'nombre' => 'Cable HDMI 2 m',
                'marca' => 'Genérica',
                'modelo' => 'HDMI-2M',
                'descripcion' => 'Cable HDMI para conectar proyectores y monitores',
                'cod_tipo_elemento' => 4,
                'stocks' => [3 => 15, 4 => 5],
            ],
        ];

        foreach ($accesorios as $datos) {
            $total = array_sum($datos['stocks']);

            $accesorio = InventarioAccesorio::updateOrCreate(
                ['nombre' => $datos['nombre']],
                [
                    'cod_marca' => $this->codMarca($datos['marca']),
                    'modelo' => $datos['modelo'],
                    'descripcion' => $datos['descripcion'],
                    'cod_tipo_elemento' => $datos['cod_tipo_elemento'],
                    'cantidad_total' => $total,
                    'cantidad_disponible' => $total,
                ]
            );

            foreach ($datos['stocks'] as $ubicacion => $cantidad) {
                StockAccesorio::updateOrCreate(
                    ['id_accesorio' => $accesorio->id_accesorio, 'cod_ubi_elemento' => $ubicacion],
                    ['cantidad_total' => $cantidad, 'cantidad_disponible' => $cantidad]
                );
            }
        }
    }

    private function guardarElemento(array $datos): void
    {
        $datos['cod_marca'] = $this->codMarca($datos['marca'] ?? null);
        unset($datos['marca']);

        Inventario::updateOrCreate(
            ['cod_elemento' => $datos['cod_elemento']],
            $datos + ['cod_estado_elemento' => Inventario::ESTADO_ACTIVO]
        );
    }

    private function codMarca(?string $nombre): ?int
    {
        return $nombre ? Marca::firstOrCreate(['marca' => $nombre])->cod_marca : null;
    }
}