<?php

namespace Tests\Feature;

use Illuminate\Foundation\Testing\RefreshDatabase;
use Tests\TestCase;
use App\Models\Usuario;
use App\Models\Inventario;

class CatalogoDisponibleTest extends TestCase
{
    use RefreshDatabase;

    public function test_elementos_disponibles_excluye_los_ya_reservados_sin_entregar()
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

        $elementoLibre = Inventario::create([
            'cod_elemento' => 'COMP-LIBRE',
            'nombre_elemento' => 'Laptop Libre',
            'cod_tipo_elemento' => 1,
            'cod_ubi_elemento' => 1,
            'cod_estado_elemento' => 1
        ]);

        $elementoReservado = Inventario::create([
            'cod_elemento' => 'COMP-RESERVADO',
            'nombre_elemento' => 'Laptop Reservada',
            'cod_tipo_elemento' => 1,
            'cod_ubi_elemento' => 1,
            'cod_estado_elemento' => 1
        ]);

        $this->actingAs($docente);

        $this->postJson('/api/mis-reserva', [
            'fecha' => now()->toDateString(),
            'plazo' => now()->addDays(3)->toDateString(),
            'detalles' => [
                ['id_elemento' => $elementoReservado->id_elemento, 'cantidad' => 1]
            ]
        ])->assertStatus(201);

        $response = $this->getJson('/api/catalogo/elementos-disponibles');

        $response->assertStatus(200);
        $ids = collect($response->json('data'))->pluck('id_elemento');

        $this->assertTrue($ids->contains($elementoLibre->id_elemento));
        $this->assertFalse($ids->contains($elementoReservado->id_elemento));
    }
}
