<?php

namespace Tests\Feature;

use Illuminate\Foundation\Testing\RefreshDatabase;
use Tests\TestCase;
use App\Models\Usuario;
use App\Models\Inventario;

class CatalogoDisponibleTest extends TestCase
{
    use RefreshDatabase;

    public function test_elementos_disponibles_se_agrupan_por_tipo_y_descuentan_al_reservar()
    {
        $this->seed(\Database\Seeders\RolSeeder::class);
        $this->seed(\Database\Seeders\EstadoUsuarioSeeder::class);
        $this->seed(\Database\Seeders\CatalogosSeeder::class);

        $docente = Usuario::create([
            'documento' => '1111111111',
            'nombre' => 'Ana',
            'apellido' => 'Docente',
            'cod_rol' => 1,
            'cod_estado_usuario' => 1,
            'password' => bcrypt('1111111111')
        ]);

        // Dos computadores del mismo tipo, cada uno con su propia marca/serial:
        // el docente no debe ver esos datos, solo cuántos hay del tipo.
        Inventario::create([
            'cod_elemento' => 'COMP-1', 'nombre_elemento' => 'Torre Dell',
            'cod_tipo_elemento' => 1, 'cod_ubi_elemento' => 1, 'cod_estado_elemento' => 1
        ]);
        Inventario::create([
            'cod_elemento' => 'COMP-2', 'nombre_elemento' => 'Torre HP',
            'cod_tipo_elemento' => 1, 'cod_ubi_elemento' => 1, 'cod_estado_elemento' => 1
        ]);

        $this->actingAs($docente);

        $antes = $this->getJson('/api/catalogo/elementos-disponibles');
        $antes->assertStatus(200);
        $filaAntes = collect($antes->json('data'))->firstWhere('cod_tipo_elemento', 1);

        $this->assertNotNull($filaAntes);
        $this->assertEquals(2, $filaAntes['cantidad_disponible']);
        $this->assertArrayNotHasKey('nombre_elemento', $filaAntes);
        $this->assertArrayNotHasKey('modelo', $filaAntes);
        $this->assertArrayNotHasKey('serial', $filaAntes);

        // El docente pide "1 computador" por tipo, sin elegir cuál
        $this->postJson('/api/mis-reserva', [
            'fecha' => now()->toDateString(),
            'plazo' => now()->addDays(3)->toDateString(),
            'detalles' => [
                ['cod_tipo_elemento' => 1, 'cantidad' => 1]
            ]
        ])->assertStatus(201);

        $despues = $this->getJson('/api/catalogo/elementos-disponibles');
        $filaDespues = collect($despues->json('data'))->firstWhere('cod_tipo_elemento', 1);

        $this->assertEquals(1, $filaDespues['cantidad_disponible']);
    }

    public function test_falla_claramente_si_no_hay_suficientes_unidades_del_tipo()
    {
        $this->seed(\Database\Seeders\RolSeeder::class);
        $this->seed(\Database\Seeders\EstadoUsuarioSeeder::class);
        $this->seed(\Database\Seeders\CatalogosSeeder::class);

        $docente = Usuario::create([
            'documento' => '4444444444',
            'nombre' => 'Sofia',
            'apellido' => 'Docente',
            'cod_rol' => 1,
            'cod_estado_usuario' => 1,
            'password' => bcrypt('4444444444')
        ]);

        Inventario::create([
            'cod_elemento' => 'PROY-1', 'nombre_elemento' => 'Proyector único',
            'cod_tipo_elemento' => 3, 'cod_ubi_elemento' => 1, 'cod_estado_elemento' => 1
        ]);

        $this->actingAs($docente);

        $respuesta = $this->postJson('/api/mis-reserva', [
            'fecha' => now()->toDateString(),
            'plazo' => now()->addDays(3)->toDateString(),
            'detalles' => [
                ['cod_tipo_elemento' => 3, 'cantidad' => 2]
            ]
        ]);

        $respuesta->assertStatus(500);
        $this->assertDatabaseCount('Reserva', 0);
    }
}
