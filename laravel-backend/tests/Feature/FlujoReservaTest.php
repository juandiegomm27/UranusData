<?php

namespace Tests\Feature;

use Illuminate\Foundation\Testing\RefreshDatabase;
use Tests\TestCase;
use App\Models\Usuario;
use App\Models\Inventario;
use App\Models\ReservaDetalle;

class FlujoReservaTest extends TestCase
{
    use RefreshDatabase; // Limpia y migra la BD en memoria para cada prueba

    public function test_ciclo_completo_reserva_entrega_y_devolucion_parcial()
    {
        // 0. Cargar los seeders obligatorios para satisfacer las llaves foráneas
        $this->seed(\Database\Seeders\RolSeeder::class);
        $this->seed(\Database\Seeders\EstadoUsuarioSeeder::class);
        $this->seed(\Database\Seeders\CatalogosSeeder::class);

        // 1. Preparar datos de prueba (Arrange)
        // Creamos un docente autenticado
        $docente = Usuario::create([
            'documento' => '1234567890',
            'nombre' => 'Juan',
            'apellido' => 'Docente',
            'cod_rol' => 1, // Docente
            'cod_estado_usuario' => 1,
            'password' => bcrypt('1234567890')
        ]);

        // Creamos un equipo físico único en el inventario (usa ubi_elemento 1 y tipo_elemento 1 creados por los seeders)
        $equipo = Inventario::create([
            'cod_elemento' => 'COMP-TEST',
            'nombre_elemento' => 'Laptop de Prueba',
            'cod_tipo_elemento' => 1,
            'cod_ubi_elemento' => 1,
            'cod_estado_elemento' => 1
        ]);

        // 2. Simular al Docente creando una reserva (Act)
        $this->actingAs($docente);

        $responseReserva = $this->postJson('/api/mis-reserva', [
            'fecha' => now()->toDateString(),
            'plazo' => now()->addDays(3)->toDateString(),
            'detalles' => [
                [
                    'id_elemento' => $equipo->id_elemento,
                    'cantidad' => 1
                ]
            ]
        ]);

        // Verificar que la reserva se creó con éxito (Assert)
        $responseReserva->assertStatus(201)
                        ->assertJsonPath('status', 'success');

        $idReserva = $responseReserva->json('data.id_Reserva');
        $idDetalle = ReservaDetalle::where('id_Reserva', $idReserva)->first()->id_detalle;

        $this->assertDatabaseHas('Reserva', ['id_Reserva' => $idReserva]);

        // 3. Simular al Técnico entregando el préstamo (Act)
        $tecnico = Usuario::create([
            'documento' => '0987654321',
            'nombre' => 'Carlos',
            'apellido' => 'Técnico',
            'cod_rol' => 2, // Técnico
            'cod_estado_usuario' => 1,
            'password' => bcrypt('1234567890')
        ]);

        $this->actingAs($tecnico);

        $responseEntrega = $this->postJson("/api/reserva/{$idReserva}/entregar");
        $responseEntrega->assertStatus(200);

        // Verificar que el equipo cambió a estado en préstamo (2)
        $this->assertDatabaseHas('inventario', [
            'id_elemento' => $equipo->id_elemento,
            'cod_estado_elemento' => 2
        ]);

        // 4. Registrar la devolución parcial del equipo (Act)
        $responseDevolucion = $this->postJson("/api/prestamo/detalles/{$idDetalle}/devolver-parcial", [
            'cantidad_a_devolver' => 1,
            'estado_devolucion' => 1 // Devuelto en buen estado (Activo)
        ]);

        $responseDevolucion->assertStatus(200);

        // Verificar que la cantidad devuelta se actualizó en la base de datos
        $this->assertDatabaseHas('reserva_detalles', [
            'id_detalle' => $idDetalle,
            'cantidad_devuelta' => 1
        ]);
    }
}