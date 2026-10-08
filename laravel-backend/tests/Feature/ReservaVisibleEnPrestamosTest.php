<?php

namespace Tests\Feature;

use Illuminate\Foundation\Testing\RefreshDatabase;
use Tests\TestCase;
use App\Models\Usuario;
use App\Models\Inventario;

class ReservaVisibleEnPrestamosTest extends TestCase
{
    use RefreshDatabase;

    public function test_reserva_del_docente_aparece_solicitada_para_tecnico_y_pasa_a_entregada()
    {
        $this->seed(\Database\Seeders\RolSeeder::class);
        $this->seed(\Database\Seeders\EstadoUsuarioSeeder::class);
        $this->seed(\Database\Seeders\CatalogosSeeder::class);

        $docente = Usuario::create([
            'documento' => '2222222222',
            'nombre' => 'Laura',
            'apellido' => 'Docente',
            'cod_rol' => 1,
            'cod_estado_usuario' => 1,
            'password' => bcrypt('2222222222')
        ]);

        $tecnico = Usuario::create([
            'documento' => '3333333333',
            'nombre' => 'Pedro',
            'apellido' => 'Tecnico',
            'cod_rol' => 2,
            'cod_estado_usuario' => 1,
            'password' => bcrypt('3333333333')
        ]);

        $equipo = Inventario::create([
            'cod_elemento' => 'ROUTER-TEST',
            'nombre_elemento' => 'Router de Prueba',
            'cod_tipo_elemento' => 1,
            'cod_ubi_elemento' => 1,
            'cod_estado_elemento' => 1
        ]);

        // 1. El docente crea la reserva
        $this->actingAs($docente);
        $respReserva = $this->postJson('/api/mis-reserva', [
            'fecha' => now()->toDateString(),
            'plazo' => now()->addDays(2)->toDateString(),
            'detalles' => [['id_elemento' => $equipo->id_elemento, 'cantidad' => 1]]
        ]);
        $respReserva->assertStatus(201);
        $idReserva = $respReserva->json('data.id_Reserva');

        // Debe existir de una vez el registro de préstamo "Solicitado"
        $this->assertDatabaseHas('prestamo', [
            'id_Reserva' => $idReserva,
            'cod_estado_prestamo' => 1
        ]);

        // Para el propio docente, sigue viéndose como "activa" (no como préstamo entregado)
        $misReservas = $this->getJson('/api/mis-reserva');
        $estadoCalculado = collect($misReservas->json('data'))
            ->firstWhere('id_Reserva', $idReserva)['estado_calculado'];
        $this->assertEquals('activa', $estadoCalculado);

        // 2. El técnico debe verla como "Solicitado" en su lista de préstamos
        $this->actingAs($tecnico);
        $respPrestamos = $this->getJson('/api/gestion/usuario/prestamos-activos');
        $respPrestamos->assertStatus(200);
        $filaTecnico = collect($respPrestamos->json('data'))->firstWhere('id_Reserva', $idReserva);
        $this->assertNotNull($filaTecnico, 'La reserva del docente no aparece en la lista de préstamos del técnico');
        $this->assertEquals(1, $filaTecnico['cod_estado_prestamo']);

        // 3. El técnico la entrega
        $respEntrega = $this->postJson("/api/reserva/{$idReserva}/entregar");
        $respEntrega->assertStatus(200);

        $this->assertDatabaseHas('prestamo', [
            'id_Reserva' => $idReserva,
            'cod_estado_prestamo' => 2
        ]);
        $this->assertDatabaseHas('inventario', [
            'id_elemento' => $equipo->id_elemento,
            'cod_estado_elemento' => 2
        ]);

        // 4. Ahora sí, para el docente pasa a "en_prestamo"
        $this->actingAs($docente);
        $misReservasFinal = $this->getJson('/api/mis-reserva');
        $estadoFinal = collect($misReservasFinal->json('data'))
            ->firstWhere('id_Reserva', $idReserva)['estado_calculado'];
        $this->assertEquals('en_prestamo', $estadoFinal);
    }
}
