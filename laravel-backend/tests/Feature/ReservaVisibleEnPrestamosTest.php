<?php

namespace Tests\Feature;

use Illuminate\Foundation\Testing\RefreshDatabase;
use Tests\TestCase;
use App\Models\Usuario;
use App\Models\Inventario;
use App\Models\ReservaDetalle;

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
            'detalles' => [['cod_tipo_elemento' => $equipo->cod_tipo_elemento, 'cantidad' => 1]]
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

        // 3. El técnico la entrega, asignando él mismo la unidad física
        $idDetalle = ReservaDetalle::where('id_Reserva', $idReserva)->first()->id_detalle;

        $respEntrega = $this->postJson("/api/reserva/{$idReserva}/entregar", [
            'asignaciones' => [
                ['id_detalle' => $idDetalle, 'id_elemento' => $equipo->id_elemento]
            ]
        ]);
        $respEntrega->assertStatus(200);

        $this->assertDatabaseHas('prestamo', [
            'id_Reserva' => $idReserva,
            'cod_estado_prestamo' => 2
        ]);
        $this->assertDatabaseHas('inventario', [
            'id_elemento' => $equipo->id_elemento,
            'cod_estado_elemento' => 2
        ]);
        $this->assertDatabaseHas('reserva_detalles', [
            'id_detalle' => $idDetalle,
            'id_elemento' => $equipo->id_elemento
        ]);

        // 4. Ahora sí, para el docente pasa a "en_prestamo" (Activo)
        $this->actingAs($docente);
        $misReservasFinal = $this->getJson('/api/mis-reserva');
        $estadoFinal = collect($misReservasFinal->json('data'))
            ->firstWhere('id_Reserva', $idReserva)['estado_calculado'];
        $this->assertEquals('en_prestamo', $estadoFinal);

        // 5. El técnico marca la devolución: para el docente pasa a "historial"
        //    y sigue viéndose tanto en préstamos (técnico) como en mis reservas (docente).
        $this->actingAs($tecnico);
        $this->postJson("/api/prestamo/detalles/{$idDetalle}/devolver-parcial", [
            'cantidad_a_devolver' => 1,
            'estado_devolucion' => 1
        ])->assertStatus(200);

        $respPrestamosFinal = $this->getJson('/api/gestion/usuario/prestamos-activos?estado=3');
        $this->assertNotNull(
            collect($respPrestamosFinal->json('data'))->firstWhere('id_Reserva', $idReserva),
            'La reserva devuelta desapareció de la lista de préstamos del técnico'
        );

        $this->actingAs($docente);
        $misReservasHistorial = $this->getJson('/api/mis-reserva');
        $filaHistorial = collect($misReservasHistorial->json('data'))->firstWhere('id_Reserva', $idReserva);
        $this->assertNotNull($filaHistorial, 'La reserva devuelta desapareció de Mis Reservas del docente');
        $this->assertEquals('historial', $filaHistorial['estado_calculado']);
    }
}
