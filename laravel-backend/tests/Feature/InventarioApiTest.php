<?php

namespace Tests\Feature;

use App\Models\HistorialBajaGeneral;
use App\Models\Inventario;
use App\Models\Usuario;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Tests\TestCase;
use App\Models\Marca;
use App\Models\InventarioAccesorio;

class InventarioApiTest extends TestCase
{
    use RefreshDatabase;

    private int $contador = 0;

    protected function setUp(): void
    {
        parent::setUp();

        $this->seed(\Database\Seeders\RolSeeder::class);
        $this->seed(\Database\Seeders\EstadoUsuarioSeeder::class);
        $this->seed(\Database\Seeders\CatalogosSeeder::class);

        $gerente = Usuario::create([
            'documento' => '3333333333',
            'nombre' => 'Gina',
            'apellido' => 'Gerente',
            'cod_rol' => 3,
            'cod_estado_usuario' => 1,
            'password' => bcrypt('3333333333'),
        ]);

        $this->actingAs($gerente);
    }

    private function crearElemento(array $datos = []): Inventario
    {
        $this->contador++;

        return Inventario::create(array_merge([
            'cod_elemento' => 'TST-' . str_pad($this->contador, 3, '0', STR_PAD_LEFT),
            'nombre_elemento' => 'Elemento de prueba ' . $this->contador,
            'cod_tipo_elemento' => 1,
            'cod_ubi_elemento' => 1,
            'cod_estado_elemento' => Inventario::ESTADO_ACTIVO,
        ], $datos));
    }

    private function datosNuevos(array $extra = []): array
    {
        return array_merge([
            'nombre_elemento' => 'Laptop Dell',
            'cod_tipo_elemento' => 1,
            'cod_ubi_elemento' => 1,
        ], $extra);
    }

    public function test_crear_elemento_nace_activo_y_genera_codigo(): void
    {
        $respuesta = $this->postJson('/api/inventario', $this->datosNuevos([
            'cod_estado_elemento' => Inventario::ESTADO_BAJA, // se ignora
        ]));

        $respuesta->assertStatus(201);

        $elemento = Inventario::find($respuesta->json('data.id_elemento'));
        $this->assertEquals(Inventario::ESTADO_ACTIVO, $elemento->cod_estado_elemento);
        $this->assertStringStartsWith('LAP-', $elemento->cod_elemento);
    }

    public function test_serial_duplicado_es_rechazado(): void
    {
        $this->crearElemento(['serial' => 'SER-001']);

        $this->postJson('/api/inventario', $this->datosNuevos(['serial' => 'SER-001']))
            ->assertStatus(422)
            ->assertJsonValidationErrors(['serial']);
    }

    public function test_relacion_padre_un_solo_nivel_sin_ciclos_y_sin_bajas(): void
    {
        $principal = $this->crearElemento();
        $componente = $this->crearElemento(['id_elemento_padre' => $principal->id_elemento]);
        $otro = $this->crearElemento();
        $enBaja = $this->crearElemento(['cod_estado_elemento' => Inventario::ESTADO_BAJA]);

        // El principal ya es componente de otro: solo se permite un nivel
        $this->postJson('/api/inventario', $this->datosNuevos(['id_elemento_padre' => $componente->id_elemento]))
            ->assertStatus(422)
            ->assertJsonValidationErrors(['id_elemento_padre']);

        // Un elemento con componentes no puede pertenecer a otro
        $this->putJson("/api/inventario/{$principal->id_elemento}", ['id_elemento_padre' => $otro->id_elemento])
            ->assertStatus(422)
            ->assertJsonValidationErrors(['id_elemento_padre']);

        // No puede pertenecer a sí mismo
        $this->putJson("/api/inventario/{$otro->id_elemento}", ['id_elemento_padre' => $otro->id_elemento])
            ->assertStatus(422)
            ->assertJsonValidationErrors(['id_elemento_padre']);

        // El principal no puede estar dado de baja
        $this->postJson('/api/inventario', $this->datosNuevos(['id_elemento_padre' => $enBaja->id_elemento]))
            ->assertStatus(422)
            ->assertJsonValidationErrors(['id_elemento_padre']);

        // Caso válido: vincular un elemento libre a un principal
        $this->putJson("/api/inventario/{$otro->id_elemento}", ['id_elemento_padre' => $principal->id_elemento])
            ->assertOk();
        $this->assertEquals($principal->id_elemento, $otro->fresh()->id_elemento_padre);
    }

    public function test_el_estado_no_se_edita_desde_actualizar(): void
    {
        $elemento = $this->crearElemento();

        $this->putJson("/api/inventario/{$elemento->id_elemento}", [
            'nombre_elemento' => 'Nombre nuevo',
            'cod_estado_elemento' => Inventario::ESTADO_BAJA,
        ])->assertOk();

        $elemento->refresh();
        $this->assertEquals('Nombre nuevo', $elemento->nombre_elemento);
        $this->assertEquals(Inventario::ESTADO_ACTIVO, $elemento->cod_estado_elemento);
    }

    public function test_solo_un_elemento_activo_puede_ir_a_mantenimiento(): void
    {
        $datos = ['cod_tipo_mantenimiento' => 1, 'descripcion' => 'Falla de prueba'];

        $enPrestamo = $this->crearElemento(['cod_estado_elemento' => Inventario::ESTADO_EN_PRESTAMO]);
        $this->postJson("/api/inventario/{$enPrestamo->id_elemento}/mantenimiento", $datos)
            ->assertStatus(400);

        $activo = $this->crearElemento();
        $this->postJson("/api/inventario/{$activo->id_elemento}/mantenimiento", $datos)
            ->assertStatus(201);

        $this->assertEquals(Inventario::ESTADO_MANTENIMIENTO, $activo->fresh()->cod_estado_elemento);
        $this->assertDatabaseHas('mantenimiento', [
            'id_elemento' => $activo->id_elemento,
            'cod_estado_mantenimiento' => 1,
        ]);
    }

    public function test_baja_se_bloquea_en_prestamo_y_en_mantenimiento(): void
    {
        $prestado = $this->crearElemento(['cod_estado_elemento' => Inventario::ESTADO_EN_PRESTAMO]);
        $enMantenimiento = $this->crearElemento(['cod_estado_elemento' => Inventario::ESTADO_MANTENIMIENTO]);

        $this->patchJson("/api/inventario/activos/{$prestado->id_elemento}/dar-de-baja", ['motivo' => 'x'])->assertStatus(422);
        $this->patchJson("/api/inventario/activos/{$enMantenimiento->id_elemento}/dar-de-baja", ['motivo' => 'x'])->assertStatus(422);

        $this->assertEquals(Inventario::ESTADO_EN_PRESTAMO, $prestado->fresh()->cod_estado_elemento);
        $this->assertEquals(Inventario::ESTADO_MANTENIMIENTO, $enMantenimiento->fresh()->cod_estado_elemento);
    }

    public function test_baja_desvincula_componentes_queda_en_historial_y_se_puede_restaurar(): void
    {
        $principal = $this->crearElemento();
        $componente = $this->crearElemento(['id_elemento_padre' => $principal->id_elemento]);

        $this->patchJson("/api/inventario/activos/{$principal->id_elemento}/dar-de-baja", ['motivo' => 'Equipo obsoleto'])
            ->assertOk();

        $this->assertEquals(Inventario::ESTADO_BAJA, $principal->fresh()->cod_estado_elemento);
        $this->assertNull($componente->fresh()->id_elemento_padre);
        $this->assertDatabaseHas('historial_bajas_general', [
            'id_original' => $principal->id_elemento,
            'tipo_item' => 'activo',
            'motivo' => 'Equipo obsoleto',
        ]);
        $this->assertDatabaseHas('inventario_movimientos', ['id_elemento' => $principal->id_elemento, 'tipo' => 'baja']);

        $idBaja = HistorialBajaGeneral::where('id_original', $principal->id_elemento)->value('id_baja');
        $this->postJson("/api/inventario/historial-bajas-general/{$idBaja}/restaurar")->assertOk();

        $this->assertEquals(Inventario::ESTADO_ACTIVO, $principal->fresh()->cod_estado_elemento);
        $this->assertDatabaseHas('inventario_movimientos', ['id_elemento' => $principal->id_elemento, 'tipo' => 'restauracion']);
    }

    public function test_la_lista_oculta_las_bajas_pero_muestra_los_prestados(): void
    {
        $activo = $this->crearElemento();
        $prestado = $this->crearElemento(['cod_estado_elemento' => Inventario::ESTADO_EN_PRESTAMO]);
        $baja = $this->crearElemento(['cod_estado_elemento' => Inventario::ESTADO_BAJA]);

        $ids = collect($this->getJson('/api/inventario?per_page=100')->assertOk()->json('data'))->pluck('id_elemento');

        $this->assertTrue($ids->contains($activo->id_elemento));
        $this->assertTrue($ids->contains($prestado->id_elemento));
        $this->assertFalse($ids->contains($baja->id_elemento));
    }

    public function test_filtro_de_ubicacion_en_accesorios_solo_muestra_su_stock(): void
    {
        $primero = $this->postJson('/api/inventario-accesorios', [
            'nombre' => 'Gancho metálico',
            'cantidad_total' => 10,
            'cod_ubi_elemento' => 1,
        ])->assertStatus(201);

        $this->postJson('/api/inventario-accesorios', [
            'id_accesorio' => $primero->json('data.id_accesorio'),
            'nombre' => 'Gancho metálico',
            'cantidad_total' => 5,
            'cod_ubi_elemento' => 2,
        ])->assertStatus(201);

        $stocks = $this->getJson('/api/inventario-accesorios?ubicacion=2')
            ->assertOk()
            ->json('data.0.stocks');

        $this->assertCount(1, $stocks);
        $this->assertEquals(2, $stocks[0]['cod_ubi_elemento']);
    }

    public function test_marcas_se_crean_sin_duplicar_y_no_se_borran_si_estan_en_uso(): void
    {
        $respuesta = $this->postJson('/api/marcas', ['marca' => 'Acme'])->assertStatus(201);
        $codMarca = $respuesta->json('data.cod_marca');

        $this->postJson('/api/marcas', ['marca' => 'Acme'])
            ->assertStatus(422)
            ->assertJsonValidationErrors(['marca']);

        $elemento = $this->crearElemento(['cod_marca' => $codMarca]);
        $this->deleteJson("/api/marcas/{$codMarca}")->assertStatus(400);
        $this->assertDatabaseHas('marca', ['cod_marca' => $codMarca]);

        $elemento->update(['cod_marca' => null]);
        $this->deleteJson("/api/marcas/{$codMarca}")->assertOk();
        $this->assertDatabaseMissing('marca', ['cod_marca' => $codMarca]);
    }

    public function test_filtro_y_busqueda_por_marca(): void
    {
        $gerente = Usuario::find('3333333333');
        $this->actingAs($gerente);

        $marca = \App\Models\Marca::firstOrCreate(['marca' => 'Dell']);
        
        $this->postJson('/api/inventario-accesorios', [
            'nombre' => 'Teclado Especial ' . uniqid(),
            'cantidad_total' => 15,
            'cod_ubi_elemento' => 1,
            'cod_marca' => $marca->cod_marca
        ])->assertStatus(201);

        $this->getJson('/api/inventario-accesorios?marca=' . $marca->cod_marca)
            ->assertOk()
            ->assertJsonFragment(['cod_marca' => $marca->cod_marca]);
    }

        public function test_restaurar_baja_de_accesorio_recrea_el_stock_si_ya_no_existe(): void
    {
        $creado = $this->postJson('/api/inventario-accesorios', [
            'nombre' => 'Gancho de prueba',
            'cantidad_total' => 10,
            'cod_ubi_elemento' => 1,
        ])->assertStatus(201);

        $idAccesorio = $creado->json('data.id_accesorio');
        $idStock = $creado->json('data.stocks.0.id_stock');

        $this->postJson("/api/inventario/accesorios/{$idStock}/dar-de-baja", ['cantidad' => 4, 'motivo' => 'Dañados'])
            ->assertOk();

        // Se traslada lo que queda: el stock de origen se elimina
        $this->postJson('/api/inventario-accesorios/trasladar', [
            'id_stock_origen' => $idStock,
            'cod_ubi_destino' => 2,
            'cantidad' => 6,
        ])->assertOk();
        $this->assertDatabaseMissing('stock_accesorios', ['id_stock' => $idStock]);

        $idBaja = HistorialBajaGeneral::where('tipo_item', 'accesorio')->value('id_baja');
        $this->postJson("/api/inventario/historial-bajas-general/{$idBaja}/restaurar")->assertOk();

        $this->assertDatabaseHas('stock_accesorios', [
            'id_accesorio' => $idAccesorio,
            'cod_ubi_elemento' => 1,
            'cantidad_total' => 4,
            'cantidad_disponible' => 4,
        ]);
        $this->assertEquals(10, InventarioAccesorio::find($idAccesorio)->cantidad_total);
        $this->assertDatabaseMissing('historial_bajas_general', ['id_baja' => $idBaja]);
    }

    public function test_busqueda_global_encuentra_usuarios_y_equipos_por_marca(): void
    {
        $marca = Marca::create(['marca' => 'Zeta']);
        $elemento = $this->crearElemento(['cod_marca' => $marca->cod_marca]);

        $porMarca = $this->getJson('/api/buscar?q=Zeta')->assertOk();
        $this->assertTrue(
            collect($porMarca->json('data.inventario'))->pluck('id_elemento')->contains($elemento->id_elemento)
        );

        $this->getJson('/api/buscar?q=Gerente&tipo=usuario')
            ->assertOk()
            ->assertJsonCount(1, 'data.usuario');
    }

        public function test_equipo_con_reserva_pendiente_no_se_da_de_baja_ni_va_a_mantenimiento(): void
    {
        $docente = Usuario::create([
            'documento' => '4444444444',
            'nombre' => 'Dora',
            'apellido' => 'Docente',
            'cod_rol' => 1,
            'cod_estado_usuario' => 1,
            'password' => bcrypt('4444444444'),
        ]);
        $gerente = Usuario::find('3333333333');
        $equipo = $this->crearElemento();

        $this->actingAs($docente);
        $idReserva = $this->postJson('/api/mis-reserva', [
            'fecha' => now()->toDateString(),
            'plazo' => now()->addDays(2)->toDateString(),
            'detalles' => [['id_elemento' => $equipo->id_elemento, 'cantidad' => 1]],
        ])->assertStatus(201)->json('data.id_Reserva');

        $this->actingAs($gerente);
        $this->patchJson("/api/inventario/activos/{$equipo->id_elemento}/dar-de-baja", ['motivo' => 'x'])
            ->assertStatus(422);
        $this->postJson("/api/inventario/{$equipo->id_elemento}/mantenimiento", [
            'cod_tipo_mantenimiento' => 1,
            'descripcion' => 'Falla',
        ])->assertStatus(422);
        $this->assertEquals(Inventario::ESTADO_ACTIVO, $equipo->fresh()->cod_estado_elemento);

        // El docente cancela su reserva y el bloqueo desaparece
        $this->actingAs($docente);
        $this->deleteJson("/api/mis-reserva/{$idReserva}")->assertOk();

        $this->actingAs($gerente);
        $this->patchJson("/api/inventario/activos/{$equipo->id_elemento}/dar-de-baja", ['motivo' => 'x'])
            ->assertOk();
    }

    public function test_no_se_crea_un_accesorio_con_nombre_duplicado(): void
    {
        $datos = ['nombre' => 'Cable HDMI', 'cantidad_total' => 5, 'cod_ubi_elemento' => 1];

        $this->postJson('/api/inventario-accesorios', $datos)->assertStatus(201);
        $this->postJson('/api/inventario-accesorios', array_merge($datos, ['nombre' => '  cable hdmi ']))
            ->assertStatus(422);

        $this->assertEquals(1, InventarioAccesorio::count());
    }

    public function test_historial_de_bajas_devuelve_resumen_de_todo_el_historial(): void
    {
        $idStock = $this->postJson('/api/inventario-accesorios', [
            'nombre' => 'Tornillo',
            'cantidad_total' => 20,
            'cod_ubi_elemento' => 1,
        ])->assertStatus(201)->json('data.stocks.0.id_stock');

        $this->postJson("/api/inventario/accesorios/{$idStock}/dar-de-baja", ['cantidad' => 2, 'motivo' => 'a'])->assertOk();
        $this->postJson("/api/inventario/accesorios/{$idStock}/dar-de-baja", ['cantidad' => 3, 'motivo' => 'b'])->assertOk();

        $this->getJson('/api/inventario/historial-bajas-general?tipo=accesorio')
            ->assertOk()
            ->assertJsonPath('resumen.registros', 2)
            ->assertJsonPath('resumen.unidades', 5);
    }
}
