<?php

namespace Tests\Feature;

use App\Models\Inventario;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Tests\TestCase;

class InventarioMovimientosTest extends TestCase
{
    use RefreshDatabase;

    public function test_historial_registra_alta_edicion_traslado_vinculo_y_baja(): void
    {
        $this->seed(\Database\Seeders\CatalogosSeeder::class);

        $portatil = Inventario::create([
            'cod_elemento' => 'PORT-T01',
            'nombre_elemento' => 'Portátil de prueba',
            'cod_tipo_elemento' => 1,
            'cod_ubi_elemento' => 1,
            'cod_estado_elemento' => Inventario::ESTADO_ACTIVO,
        ]);

        $cargador = Inventario::create([
            'cod_elemento' => 'CARG-T01',
            'nombre_elemento' => 'Cargador de prueba',
            'cod_tipo_elemento' => 1,
            'cod_ubi_elemento' => 1,
            'cod_estado_elemento' => Inventario::ESTADO_ACTIVO,
            'id_elemento_padre' => $portatil->id_elemento,
        ]);

        // Altas y vínculo registrado en el principal
        $this->assertDatabaseHas('inventario_movimientos', ['id_elemento' => $portatil->id_elemento, 'tipo' => 'alta']);
        $this->assertDatabaseHas('inventario_movimientos', ['id_elemento' => $cargador->id_elemento, 'tipo' => 'alta']);
        $this->assertDatabaseHas('inventario_movimientos', ['id_elemento' => $portatil->id_elemento, 'tipo' => 'vinculo']);

        // Edición y traslado
        $cargador->update(['serial' => 'SER-001']);
        $this->assertDatabaseHas('inventario_movimientos', ['id_elemento' => $cargador->id_elemento, 'tipo' => 'edicion']);

        $portatil->update(['cod_ubi_elemento' => 2]);
        $this->assertDatabaseHas('inventario_movimientos', ['id_elemento' => $portatil->id_elemento, 'tipo' => 'traslado']);

        // Baja del principal: el cargador queda independiente y ambos lo registran
        $portatil->motivoMovimiento = 'Equipo obsoleto';
        $portatil->update(['cod_estado_elemento' => Inventario::ESTADO_BAJA]);

        $this->assertDatabaseHas('inventario_movimientos', ['id_elemento' => $portatil->id_elemento, 'tipo' => 'baja']);
        $this->assertDatabaseHas('inventario_movimientos', ['id_elemento' => $cargador->id_elemento, 'tipo' => 'vinculo']);
        $this->assertNull($cargador->fresh()->id_elemento_padre);
    }
}